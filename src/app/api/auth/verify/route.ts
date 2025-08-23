import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Enable verbose logging for debugging - can be disabled by setting VERBOSE_LOGIN=false
const VERBOSE_LOGIN = process.env.VERBOSE_LOGIN !== 'false';

function log(message: string, data?: any) {
  if (VERBOSE_LOGIN) {
    console.log(`[VERIFY DEBUG] ${message}`, data ? data : '');
  }
}

export async function GET() {
  try {
    log('=== SESSION VERIFICATION START ===');
    
    const supabase = getServiceSupabase();
    log('Supabase service client initialized');
    
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    log('Session cookie retrieved:', { 
      exists: !!sessionCookie, 
      hasValue: !!sessionCookie?.value,
      cookieName: sessionCookie?.name,
      cookiePath: sessionCookie?.path
    });

    if (!sessionCookie?.value) {
      log('No session cookie found');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Decode session cookie
    log('Attempting to decode session cookie');
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
    log('Session data decoded successfully:', { uid: sessionData.uid, ts: sessionData.ts });
    
    const { uid, ts } = sessionData;

    // Check if session is not too old (24 hours)
    const sessionAge = Date.now() - ts;
    const maxAge = 24 * 60 * 60 * 1000;
    log('Session age check:', { 
      sessionAge, 
      maxAge, 
      isExpired: sessionAge > maxAge,
      sessionAgeHours: Math.round(sessionAge / (60 * 60 * 1000) * 100) / 100
    });
    
    if (sessionAge > maxAge) {
      log('Session expired');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    log('Session age validation passed, querying user data for uid:', uid);

    // Fetch user data (excluding password_hash)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, full_name, role, status')
      .eq('id', uid)
      .eq('status', 'active')
      .single();

    if (error) {
      log('Database query error during verification:', error);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (!user) {
      log('No user found for uid:', uid);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    log('User verification successful:', { 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      status: user.status 
    });
    
    log('=== SESSION VERIFICATION SUCCESS ===');

    return NextResponse.json({ 
      authenticated: true, 
      user 
    });

  } catch (error) {
    log('=== SESSION VERIFICATION FAILED ===');
    log('Exception caught in session verification:', error);
    log('Error type:', typeof error);
    log('Error message:', error instanceof Error ? error.message : 'Unknown error type');
    log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
