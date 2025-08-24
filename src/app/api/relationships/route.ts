import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
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

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();

    // Try to use the view first, fallback to basic table if view doesn't exist
    let query = supabase
      .from('entity_relationships_view')
      .select('*')
      .eq('entity_id', entityId);

    if (typeOfRecord) {
      query = query.eq('type_of_record', typeOfRecord);
    }

    let { data, error } = await query;

    // If view doesn't exist, fallback to basic table
    if (error && error.message && error.message.includes('relation "entity_relationships_view" does not exist')) {
      console.log('View not found, falling back to basic table');
      
      query = supabase
        .from('entity_related_data')
        .select('*')
        .eq('entity_id', entityId);

      if (typeOfRecord) {
        query = query.eq('type_of_record', typeOfRecord);
      }

      const fallbackResult = await query;
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    // Ensure we have the relationship ID field for editing
    if (data && data.length > 0) {
      // Check if the data has the relationship ID field
      const hasRelationshipId = 'id' in data[0];
      console.log('API: Data has relationship ID field:', hasRelationshipId);
      
      if (!hasRelationshipId) {
        console.log('API: Missing relationship ID field, enriching data with relationship IDs');
        
        // Enrich the data with relationship IDs by querying entity_related_data
        const enrichedData = await Promise.all(
          data.map(async (item: any) => {
            try {
              const { data: relationshipData, error: relError } = await supabase
                .from('entity_related_data')
                .select('id, relationship_description')
                .eq('entity_id', entityId)
                .eq('related_data_id', item.related_data_id || item.id)
                .eq('type_of_record', item.type_of_record)
                .single();

              if (relError) {
                console.warn('API: Could not find relationship data for item:', item);
                return {
                  ...item,
                  relationship_id: null,
                  relationship_description: item.relationship_description || null
                };
              }

              return {
                ...item,
                relationship_id: relationshipData.id,
                relationship_description: relationshipData.relationship_description
              };
            } catch (error) {
              console.warn('API: Error enriching relationship data:', error);
              return {
                ...item,
                relationship_id: null,
                relationship_description: item.relationship_description || null
              };
            }
          })
        );
        
        data = enrichedData;
      }
    }

    if (error) {
      console.error('Supabase error:', error);
      await AppLogger.error('api/relationships', 'GET', 'Failed to fetch relationships', error, { entityId, typeOfRecord });
      
      return NextResponse.json({ 
        error: 'Failed to fetch relationships',
        details: error.message 
      }, { status: 500 });
    }

    await AppLogger.info('api/relationships', 'GET', 'Successfully fetched relationships', { entityId, typeOfRecord, count: data?.length });
    
    // Add metadata about the data source
    const responseData = {
      data: data || [],
      metadata: {
        source: 'entity_relationships_view',
        count: data?.length || 0,
        hasDisplayNames: data && data.length > 0 && 'related_data_display_name' in data[0]
      }
    };
    
    return NextResponse.json(responseData);
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