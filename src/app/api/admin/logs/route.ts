import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/session';
import { AppLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid login session required.' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    // Verify the user is an admin
    const { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const recentLogs = await AppLogger.getRecentErrors(limit);
    return NextResponse.json({ logs: recentLogs });
  } catch (error) {
    console.error('Failed to get logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
