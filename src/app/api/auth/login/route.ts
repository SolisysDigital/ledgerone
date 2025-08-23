import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Enable verbose logging for debugging - can be disabled by setting VERBOSE_LOGIN=false
const VERBOSE_LOGIN = process.env.VERBOSE_LOGIN !== 'false';

function log(message: string, data?: any) {
  if (VERBOSE_LOGIN) {
    console.log(`[LOGIN DEBUG] ${message}`, data ? data : '');
  }
}

export async function POST(req: Request) {
  try {
    log('=== LOGIN ATTEMPT START ===');
    
    const supabase = getServiceSupabase();
    log('Supabase service client initialized');
    
    const body = await req.json();
    log('Request body received:', { username: body.username ? '***' : 'undefined', hasPassword: !!body.password });
    
    const { username, password } = body;

    if (!username || !password) {
      log('Missing credentials:', { hasUsername: !!username, hasPassword: !!password });
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    log('Credentials validation passed, querying database for user:', username);

    // Fetch minimal fields; never return password_hash
    const { data, error } = await supabase
      .from('users')
      .select('id, username, password_hash, full_name, role, status')
      .eq('username', username)
      .eq('status', 'active')
      .single();

    if (error) {
      log('Database query error:', error);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!data) {
      log('No user found with username:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    log('User found in database:', { 
      id: data.id, 
      username: data.username, 
      role: data.role, 
      status: data.status,
      hasPasswordHash: !!data.password_hash 
    });

    // Verify password using bcrypt
    log('Starting password verification with bcrypt');
    const passwordValid = await bcrypt.compare(password, data.password_hash || '');
    log('Password verification result:', { isValid: passwordValid, passwordLength: password.length });
    
    if (!passwordValid) {
      log('Password verification failed for username:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    log('Password verification successful for username:', username, 'Role:', data.role);

    // Create a signed session/cookie
    const user = {
      id: data.id,
      username: data.username,
      full_name: data.full_name ?? 'User',
      role: data.role ?? 'user',
      status: data.status ?? 'active',
    };

    log('User object created for session:', user);

    // Set a simple session cookie
    const sessionData = { uid: user.id, ts: Date.now() };
    log('Session data created:', sessionData);
    
    const res = NextResponse.json({ user });
    res.cookies.set('session', Buffer.from(JSON.stringify(sessionData)).toString('base64'), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    log('Session cookie set successfully');
    log('=== LOGIN ATTEMPT SUCCESS ===');
    
    return res;
  } catch (error) {
    log('=== LOGIN ATTEMPT FAILED ===');
    log('Exception caught in login API:', error);
    log('Error type:', typeof error);
    log('Error message:', error instanceof Error ? error.message : 'Unknown error type');
    log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return detailed error in development, generic error in production
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
