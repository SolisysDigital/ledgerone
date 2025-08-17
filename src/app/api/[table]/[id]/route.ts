import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { tableConfigs } from '@/lib/tableConfigs';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { table, id } = resolvedParams;
    
    // Build-time safety check
    if (!table || !id) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    
    const config = tableConfigs[table as keyof typeof tableConfigs];
    if (!config) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Only proceed if we have a valid Supabase connection
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { table, id } = resolvedParams;
    
    // Build-time safety check
    if (!table || !id) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    
    const config = tableConfigs[table as keyof typeof tableConfigs];
    if (!config) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Only proceed if we have a valid Supabase connection
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 