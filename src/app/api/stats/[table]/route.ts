import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { tableConfigs } from '@/lib/tableConfigs';
// SECURITY FIX: Import session utility to inspect user authentication on server side
import { getCurrentUserId } from '@/lib/session';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const resolvedParams = await params;
    const { table } = resolvedParams;

    // SECURITY FIX: Enforce server-side user authentication. Unauthenticated requests are rejected.
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid login session required.' }, { status: 401 });
    }

    if (!table) {
      return NextResponse.json({ error: 'Table parameter is required' }, { status: 400 });
    }

    const config = tableConfigs[table as keyof typeof tableConfigs];
    if (!config) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();

    // Get total count
    // SECURITY FIX: Constrain count query strictly to records owned by the authenticated user
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({ error: 'Failed to get count' }, { status: 500 });
    }

    // Get recent records (last 5)
    // SECURITY FIX: Constrain recent records fetch strictly to records owned by the authenticated user
    const { data: recentRecords, error: recentError } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Recent records error:', recentError);
      return NextResponse.json({ error: 'Failed to get recent records' }, { status: 500 });
    }

    return NextResponse.json({
      totalCount: count || 0,
      recentRecords: recentRecords || []
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 