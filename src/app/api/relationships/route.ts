import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';
import { getHoverPopupData } from '@/lib/relationshipActions';
import { getCurrentUserId } from '@/lib/session';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // SECURITY FIX: Enforce server-side user authentication for fetching relationships
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid login session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const typeOfRecord = searchParams.get('typeOfRecord');

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID is required' }, { status: 400 });
    }
    
    // Use the getHoverPopupData function to get complete data for hover popups
    const relationships = await getHoverPopupData(entityId);
    
    // Filter by type if specified
    let filteredRelationships = relationships;
    if (typeOfRecord) {
      filteredRelationships = relationships.filter(rel => rel.type_of_record === typeOfRecord);
    }

    // SECURITY FIX: Ensure the retrieved relationships belong to the authenticated user
    const userOwnedRelationships = filteredRelationships.filter(rel => rel.user_id === userId);

    // Transform the data to match the expected API response format
    const transformedData = userOwnedRelationships.map(relationship => {
      // Extract the additional fields for hover popups (excluding the base relationship fields)
      const { id, related_data_id, type_of_record, relationship_description, related_data_display_name, ...additionalFields } = relationship;
      
      return {
        relationship_id: id,
        entity_id: entityId, // Use the entityId from the request
        related_data_id: related_data_id,
        type_of_record: type_of_record,
        relationship_description: relationship_description,
        created_at: new Date().toISOString(), // Use current timestamp as fallback
        updated_at: new Date().toISOString(), // Use current timestamp as fallback
        related_data_display_name: related_data_display_name,
        // Include all the additional fields for hover popups
        ...additionalFields
      };
    });

    // Log the response for debugging
    console.log('API: Returning relationships with complete data for hover popups');
    console.log('API: Sample relationship data:', transformedData[0]);

    return NextResponse.json({
      data: transformedData,
      metadata: {
        source: 'getHoverPopupData_function',
        count: transformedData.length,
        hasDisplayNames: true,
        hasCompleteData: true
      }
    });

  } catch (error) {
    console.error('API: Error fetching relationships:', error);
    const resolvedEntityId = request.nextUrl.searchParams.get('entityId');
    await AppLogger.error('relationships_api', 'get_relationships_failed', 'Failed to fetch relationships', error as Error, { 
      entityId: resolvedEntityId,
      typeOfRecord: request.nextUrl.searchParams.get('typeOfRecord')
    });
    
    return NextResponse.json({ 
      error: 'Failed to fetch relationships',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY FIX: Enforce server-side user authentication for creating relationships
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid login session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { entityId, relatedDataId, typeOfRecord, relationshipDescription } = body;

    if (!body || !entityId || !relatedDataId || !typeOfRecord) {
      return NextResponse.json({ error: 'Entity ID, related data ID, and type of record are required' }, { status: 400 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();

    // Check if relationship already exists
    const { data: existingRelationship, error: checkError } = await (supabase as any)
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
    
    const insertData: any = {
      entity_id: entityId,
      related_data_id: relatedDataId,
      type_of_record: typeOfRecord,
      relationship_description: relationshipDescription || null,
      // SECURITY FIX: Associate relationship strictly with the authenticated user
      user_id: userId
    };
    
    // Create new relationship
    const { data, error } = await (supabase as any)
      .from('entity_related_data')
      .insert(insertData)
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