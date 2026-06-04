import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/session';
import { AppLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid login session required.' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    // Verify user is admin
    const { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Missing log ID' }, { status: 400 });
    }

    const logData = await AppLogger.getLogById(id);
    if (!logData) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json({ log: logData });
  } catch (error) {
    console.error('Failed to get log detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
