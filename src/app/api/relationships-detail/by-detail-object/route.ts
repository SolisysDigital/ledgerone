import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailObjectId = searchParams.get('detail_object_id');
    const detailObjectType = searchParams.get('detail_object_type');

    if (!detailObjectId || !detailObjectType) {
      return NextResponse.json({ 
        error: 'Detail object ID and type are required' 
      }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Find all entities that are related to this detail object
    const { data: relationships, error } = await supabase
      .from('entity_related_data')
      .select(`
        id,
        entity_id,
        type_of_record,
        relationship_description,
        created_at,
        updated_at
      `)
      .eq('related_data_id', detailObjectId)
      .eq('type_of_record', detailObjectType);

    if (error) {
      console.error('Error fetching relationships by detail object:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch relationships' 
      }, { status: 500 });
    }

    if (!relationships || relationships.length === 0) {
      return NextResponse.json({ 
        relationships: [],
        source: 'by_detail_object_api'
      });
    }

    // Fetch entity details for each relationship
    const entityIds = relationships.map(r => r.entity_id);
    const { data: entities, error: entityError } = await supabase
      .from('entities')
      .select('id, name, type, created_at, updated_at')
      .in('id', entityIds);

    if (entityError) {
      console.error('Error fetching entities:', entityError);
      return NextResponse.json({ 
        error: 'Failed to fetch entity details' 
      }, { status: 500 });
    }

    // Combine relationship data with entity details
    const enrichedRelationships = relationships.map(relationship => {
      const entity = entities?.find(e => e.id === relationship.entity_id);
      return {
        relationship_id: relationship.id,
        entity_id: relationship.entity_id,
        type_of_record: relationship.type_of_record,
        relationship_description: relationship.relationship_description,
        created_at: relationship.created_at,
        updated_at: relationship.updated_at,
        entity: entity || null
      };
    });

    return NextResponse.json({
      relationships: enrichedRelationships,
      source: 'by_detail_object_api'
    });

  } catch (error) {
    console.error('API: Error fetching relationships by detail object:', error);
    await AppLogger.error('relationships_api', 'get_relationships_by_detail_object_failed', 'Failed to fetch relationships by detail object', error as Error, {
      detailObjectId: request.nextUrl.searchParams.get('detail_object_id'),
      detailObjectType: request.nextUrl.searchParams.get('detail_object_type')
    });

    return NextResponse.json({
      error: 'Failed to fetch relationships by detail object',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
