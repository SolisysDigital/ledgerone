import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error('Missing required environment variables for authentication');
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false }});
    
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Fetch minimal fields; never return password_hash
    const { data, error } = await supabase
      .from('users')
      .select('id, username, password_hash, full_name, role, status')
      .eq('username', username)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.log('Login failed for username:', username, 'Error:', error);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password using bcrypt
    const passwordValid = await bcrypt.compare(password, data.password_hash || '');
    if (!passwordValid) {
      console.log('Password verification failed for username:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login successful for username:', username, 'Role:', data.role);

    // Create a signed session/cookie
    const user = {
      id: data.id,
      username: data.username,
      full_name: data.full_name ?? 'User',
      role: data.role ?? 'user',
      status: data.status ?? 'active',
    };

    // Set a simple session cookie
    const res = NextResponse.json({ user });
    res.cookies.set('session', Buffer.from(JSON.stringify({ uid: user.id, ts: Date.now() })).toString('base64'), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
