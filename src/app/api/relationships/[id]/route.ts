import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const relationshipId = params.id;

    const { error } = await supabase
      .from('entity_related_data')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      await AppLogger.error('api/relationships/[id]', 'DELETE', 'Failed to delete relationship', error, { relationshipId });
      return NextResponse.json({ error: 'Failed to delete relationship' }, { status: 500 });
    }

    await AppLogger.info('api/relationships/[id]', 'DELETE', 'Successfully deleted relationship', { relationshipId });
    return NextResponse.json({ success: true });
  } catch (error) {
    await AppLogger.error('api/relationships/[id]', 'DELETE', 'Exception in DELETE relationship', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const relationshipId = params.id;
    const body = await request.json();
    const { relationshipDescription } = body;

    const { data, error } = await supabase
      .from('entity_related_data')
      .update({
        relationship_description: relationshipDescription || null
      })
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) {
      await AppLogger.error('api/relationships/[id]', 'PUT', 'Failed to update relationship', error, { relationshipId });
      return NextResponse.json({ error: 'Failed to update relationship' }, { status: 500 });
    }

    await AppLogger.info('api/relationships/[id]', 'PUT', 'Successfully updated relationship', { relationshipId });
    return NextResponse.json(data);
  } catch (error) {
    await AppLogger.error('api/relationships/[id]', 'PUT', 'Exception in PUT relationship', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 