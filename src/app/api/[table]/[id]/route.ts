import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
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
    
    // TEMPORARY: Explicit exclusion for auth routes while fixing static precedence
    if (table === 'auth') {
      return NextResponse.json({ 
        error: 'Auth routes should use static handlers. Use /api/auth/login instead.',
        buildId: '2025-08-24-01:17'
      }, { status: 404 });
    }
    
    // Convert kebab-case route to snake_case for tableConfigs lookup and database queries
    const dbTable = table.replace(/-/g, '_');
    
    const config = tableConfigs[dbTable as keyof typeof tableConfigs];
    if (!config) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();
    console.log(`[API] Using service role client for table: ${dbTable}, id: ${id}`);

    const { data, error } = await supabase
      .from(dbTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    console.log(`[API] Table ${dbTable}: Found record with id: ${id}`);

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
    
    // TEMPORARY: Explicit exclusion for auth routes while fixing static precedence
    if (table === 'auth') {
      return NextResponse.json({ 
        error: 'Auth routes should use static handlers. Use /api/auth/login instead.',
        buildId: '2025-08-24-01:17'
      }, { status: 404 });
    }
    
    // Convert kebab-case route to snake_case for tableConfigs lookup and database queries
    const dbTable = table.replace(/-/g, '_');
    
    const config = tableConfigs[dbTable as keyof typeof tableConfigs];
    if (!config) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();
    console.log(`[API] Using service role client for DELETE on table: ${dbTable}, id: ${id}`);

    const { error } = await supabase
      .from(dbTable)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    console.log(`[API] Table ${dbTable}: Successfully deleted record with id: ${id}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 