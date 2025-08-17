import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const typeOfRecord = searchParams.get('typeOfRecord');

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID is required' }, { status: 400 });
    }

    let query = supabase
      .from('entity_related_data')
      .select(`
        *,
        related_record:related_data_id(
          id,
          name,
          email,
          phone,
          bank_name,
          provider,
          platform,
          cardholder_name,
          url,
          account_name
        )
      `)
      .eq('entity_id', entityId);

    if (typeOfRecord) {
      query = query.eq('type_of_record', typeOfRecord);
    }

    const { data, error } = await query;

    if (error) {
      await AppLogger.error('api/relationships', 'GET', 'Failed to fetch relationships', error, { entityId, typeOfRecord });
      return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
    }

    await AppLogger.info('api/relationships', 'GET', 'Successfully fetched relationships', { entityId, typeOfRecord, count: data?.length });
    return NextResponse.json(data);
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
      return NextResponse.json({ error: 'Entity ID, related data ID, and type of record are required' }, { status: 400 });
    }

    // Check if relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('entity_related_data')
      .select('id')
      .eq('entity_id', entityId)
      .eq('related_data_id', relatedDataId)
      .eq('type_of_record', typeOfRecord)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      await AppLogger.error('api/relationships', 'POST', 'Failed to check existing relationship', checkError, { entityId, relatedDataId, typeOfRecord });
      return NextResponse.json({ error: 'Failed to check existing relationship' }, { status: 500 });
    }

    if (existingRelationship) {
      return NextResponse.json({ error: 'Relationship already exists' }, { status: 409 });
    }

    // Create new relationship
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
      await AppLogger.error('api/relationships', 'POST', 'Failed to create relationship', error, { entityId, relatedDataId, typeOfRecord });
      return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
    }

    await AppLogger.info('api/relationships', 'POST', 'Successfully created relationship', { entityId, relatedDataId, typeOfRecord, relationshipId: data.id });
    return NextResponse.json(data);
  } catch (error) {
    await AppLogger.error('api/relationships', 'POST', 'Exception in POST relationships', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 