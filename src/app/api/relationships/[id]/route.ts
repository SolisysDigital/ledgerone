import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Relationship ID is required' }, { status: 400 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();

    const { data, error } = await (supabase as any)
      .from('entity_related_data')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      await AppLogger.error('api/relationships/[id]', 'GET', 'Failed to fetch relationship', error, { relationshipId: id });
      return NextResponse.json({ error: 'Failed to fetch relationship' }, { status: 500 });
    }

    if (!data) {
      await AppLogger.info('api/relationships/[id]', 'GET', 'Relationship not found', { relationshipId: id });
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    await AppLogger.info('api/relationships/[id]', 'GET', 'Successfully fetched relationship', { relationshipId: id });
    return NextResponse.json(data);
  } catch (error) {
    await AppLogger.error('api/relationships/[id]', 'GET', 'Exception in GET relationship', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: relationshipId } = await params;

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();

    const { error } = await (supabase as any)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: relationshipId } = await params;
    const body = await request.json();
    const { relationshipDescription } = body;

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();

    const { data, error } = await (supabase as any)
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