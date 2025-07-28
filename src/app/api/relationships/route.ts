import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID is required' }, { status: 400 });
    }

    // Get relationships
    const { data: relationships, error: relationshipsError } = await supabase
      .from('entity_related_data')
      .select(`
        id,
        related_data_id,
        type_of_record,
        relationship_description
      `)
      .eq('entity_id', entityId)
      .order('type_of_record', { ascending: true });

    if (relationshipsError) {
      await AppLogger.error('api/relationships', 'GET', 'Failed to fetch relationships', relationshipsError, { entityId });
      return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
    }

    // Get display field mapping
    const getDisplayField = (type: string) => {
      const displayFields: Record<string, string> = {
        contacts: 'name',
        emails: 'email',
        phones: 'phone',
        bank_accounts: 'bank_name',
        investment_accounts: 'provider',
        crypto_accounts: 'platform',
        credit_cards: 'cardholder_name',
        websites: 'url',
        hosting_accounts: 'provider'
      };
      return displayFields[type] || 'name';
    };

    // Enrich relationships with display names
    const enrichedRelationships = await Promise.all(
      (relationships || []).map(async (relationship) => {
        try {
          const displayField = getDisplayField(relationship.type_of_record);
          
          const { data: relatedData, error: relatedDataError } = await supabase
            .from(relationship.type_of_record)
            .select(displayField)
            .eq('id', relationship.related_data_id)
            .single();

          if (relatedDataError) {
            return {
              ...relationship,
              related_data_display_name: 'Unknown Record'
            };
          }

          return {
            ...relationship,
            related_data_display_name: (relatedData as any)?.[displayField] || 'Unnamed Record'
          };
        } catch (error) {
          return {
            ...relationship,
            related_data_display_name: 'Error Loading Record'
          };
        }
      })
    );

    await AppLogger.info('api/relationships', 'GET', 'Successfully fetched relationships', { entityId, count: enrichedRelationships?.length });
    return NextResponse.json(enrichedRelationships);
  } catch (error) {
    await AppLogger.error('api/relationships', 'GET', 'Exception in GET relationships', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId, relatedDataId, typeOfRecord, relationshipDescription } = body;

    if (!entityId || !relatedDataId || !typeOfRecord) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('entity_related_data')
      .insert({
        entity_id: entityId,
        related_data_id: relatedDataId,
        type_of_record: typeOfRecord,
        relationship_description: relationshipDescription || null
      })
      .select()
      .single();

    if (error) {
      await AppLogger.error('api/relationships', 'POST', 'Failed to create relationship', error, body);
      return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
    }

    await AppLogger.info('api/relationships', 'POST', 'Successfully created relationship', { entityId, relatedDataId, typeOfRecord });
    return NextResponse.json(data);
  } catch (error) {
    await AppLogger.error('api/relationships', 'POST', 'Exception in POST relationships', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 