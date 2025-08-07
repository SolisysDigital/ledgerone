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

    console.log('POST /api/relationships - Request body:', body);

    if (!entityId || !relatedDataId || !typeOfRecord) {
      console.log('POST /api/relationships - Missing required fields:', { entityId, relatedDataId, typeOfRecord });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: { entityId, relatedDataId, typeOfRecord }
      }, { status: 400 });
    }

    // Check if the relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('entity_related_data')
      .select('id')
      .eq('entity_id', entityId)
      .eq('related_data_id', relatedDataId)
      .eq('type_of_record', typeOfRecord)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
      console.log('POST /api/relationships - Error checking existing relationship:', checkError);
      await AppLogger.error('api/relationships', 'POST', 'Error checking existing relationship', checkError, body);
      return NextResponse.json({ error: 'Failed to check existing relationship' }, { status: 500 });
    }

    if (existingRelationship) {
      console.log('POST /api/relationships - Relationship already exists:', existingRelationship);
      return NextResponse.json({ 
        error: 'This relationship already exists',
        details: { entityId, relatedDataId, typeOfRecord }
      }, { status: 409 });
    }

    // Verify that the entity exists
    const { data: entity, error: entityError } = await supabase
      .from('entities')
      .select('id')
      .eq('id', entityId)
      .single();

    if (entityError || !entity) {
      console.log('POST /api/relationships - Entity not found:', entityError);
      return NextResponse.json({ 
        error: 'Entity not found',
        details: { entityId }
      }, { status: 404 });
    }

    // Verify that the related data exists
    const { data: relatedData, error: relatedDataError } = await supabase
      .from(typeOfRecord)
      .select('id')
      .eq('id', relatedDataId)
      .single();

    if (relatedDataError || !relatedData) {
      console.log('POST /api/relationships - Related data not found:', relatedDataError);
      return NextResponse.json({ 
        error: `${typeOfRecord} not found`,
        details: { relatedDataId, typeOfRecord }
      }, { status: 404 });
    }

    // Create the relationship
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
      console.log('POST /api/relationships - Database error:', error);
      await AppLogger.error('api/relationships', 'POST', 'Failed to create relationship', error, body);
      
      // Provide more specific error messages
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'This relationship already exists',
          details: { entityId, relatedDataId, typeOfRecord }
        }, { status: 409 });
      } else if (error.code === '23503') { // Foreign key constraint violation
        return NextResponse.json({ 
          error: 'Invalid entity or related data reference',
          details: { entityId, relatedDataId, typeOfRecord }
        }, { status: 400 });
      } else {
        return NextResponse.json({ 
          error: 'Failed to create relationship',
          details: error.message
        }, { status: 500 });
      }
    }

    console.log('POST /api/relationships - Successfully created relationship:', data);
    await AppLogger.info('api/relationships', 'POST', 'Successfully created relationship', { entityId, relatedDataId, typeOfRecord });
    return NextResponse.json(data);
  } catch (error) {
    console.log('POST /api/relationships - Exception:', error);
    await AppLogger.error('api/relationships', 'POST', 'Exception in POST relationships', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 