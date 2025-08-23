import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Decode session cookie
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
    const { uid, ts } = sessionData;

    // Check if session is not too old (24 hours)
    const sessionAge = Date.now() - ts;
    if (sessionAge > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Fetch user data (excluding password_hash)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, full_name, role, status')
      .eq('id', uid)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user 
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
