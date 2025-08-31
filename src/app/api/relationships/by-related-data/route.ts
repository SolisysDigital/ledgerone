import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relatedDataId = searchParams.get('related_data_id');
    const typeOfRecord = searchParams.get('type_of_record');

    if (!relatedDataId || !typeOfRecord) {
      return NextResponse.json({ error: 'Related data ID and type of record are required' }, { status: 400 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();
    
    // Find the relationship where this related data belongs to an entity
    const { data: relationship, error } = await (supabase as any)
      .from('entity_related_data')
      .select(`
        id,
        entity_id,
        type_of_record,
        relationship_description
      `)
      .eq('related_data_id', relatedDataId)
      .eq('type_of_record', typeOfRecord)
      .single();

    if (error) {
      console.error('Error fetching relationship by related data:', error);
      return NextResponse.json({ error: 'Relationship not found for this related data' }, { status: 404 });
    }

    // If we found a relationship, get the entity details
    if (relationship) {
      const { data: entity, error: entityError } = await (supabase as any)
        .from('entities')
        .select('id, name, type')
        .eq('id', (relationship as any).entity_id)
        .single();

      if (entityError) {
        console.error('Error fetching entity:', entityError);
        return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
      }

      return NextResponse.json({
        ...(relationship as any),
        entities: entity
      });
    }

    return NextResponse.json(relationship);

  } catch (error) {
    console.error('API: Error finding relationship by related data:', error);
    await AppLogger.error('relationships_api', 'get_relationship_by_related_data_failed', 'Failed to find relationship by related data', error as Error, { 
      relatedDataId: request.nextUrl.searchParams.get('related_data_id'),
      typeOfRecord: request.nextUrl.searchParams.get('type_of_record')
    });
    
    return NextResponse.json({ 
      error: 'Failed to find relationship by related data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
