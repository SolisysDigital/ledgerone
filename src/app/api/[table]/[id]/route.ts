import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { tableConfigs } from '@/lib/tableConfigs';
import { AppLogger } from '@/lib/logger';
// SECURITY FIX: Import session utility to inspect user authentication on server side
import { getCurrentUserId } from '@/lib/session';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { table, id } = resolvedParams;
    
    // SECURITY FIX: Enforce server-side user authentication. Unauthenticated requests are rejected.
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid login session required.' }, { status: 401 });
    }
    
    // Build-time safety check
    if (!table || !id) {
      await AppLogger.error('api/[table]/[id]', 'GET', 'Invalid parameters provided', new Error('Missing table or id parameter'), { table, id });
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
      await AppLogger.error('api/[table]/[id]', 'GET', `Table not found: ${dbTable}`, new Error('Table not found in tableConfigs'), { table, dbTable, id });
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();
    console.log(`[API] Using service role client for table: ${dbTable}, id: ${id}`);

    // SECURITY FIX: Constrain detail fetch strictly to the record owned by the authenticated user
    const { data, error } = await supabase
      .from(dbTable)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      await AppLogger.error('api/[table]/[id]', 'GET', `Failed to fetch record from ${dbTable}`, error as Error, { table, dbTable, id, supabaseError: error });
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    console.log(`[API] Table ${dbTable}: Found record with id: ${id}`);

    return NextResponse.json(data);

  } catch (error) {
    console.error('API error:', error);
    const resolvedParams = await params;
    await AppLogger.error('api/[table]/[id]', 'GET', 'Exception in GET endpoint', error as Error, { table: resolvedParams.table, id: resolvedParams.id });
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
    
    // SECURITY FIX: Enforce server-side user authentication. Unauthenticated requests are rejected.
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid login session required.' }, { status: 401 });
    }
    
    // Build-time safety check
    if (!table || !id) {
      await AppLogger.error('api/[table]/[id]', 'DELETE', 'Invalid parameters provided', new Error('Missing table or id parameter'), { table, id });
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
      await AppLogger.error('api/[table]/[id]', 'DELETE', `Table not found: ${dbTable}`, new Error('Table not found in tableConfigs'), { table, dbTable, id });
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();
    console.log(`[API] Using service role client for DELETE on table: ${dbTable}, id: ${id}`);

    // SECURITY FIX: Constrain record deletion strictly to the record owned by the authenticated user
    const { error } = await supabase
      .from(dbTable)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      await AppLogger.error('api/[table]/[id]', 'DELETE', `Failed to delete record from ${dbTable}`, error as Error, { table, dbTable, id, supabaseError: error });
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    console.log(`[API] Table ${dbTable}: Successfully deleted record with id: ${id}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API error:', error);
    const resolvedParams = await params;
    await AppLogger.error('api/[table]/[id]', 'DELETE', 'Exception in DELETE endpoint', error as Error, { table: resolvedParams.table, id: resolvedParams.id });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
