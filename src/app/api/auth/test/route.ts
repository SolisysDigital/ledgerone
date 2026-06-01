import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
// SECURITY FIX: Import session utility to inspect user authentication on server side
import { getCurrentUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('=== TEST ENDPOINT START ===');
    
    // SECURITY FIX: Enforce server-side user authentication.
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    
    // SECURITY FIX: Enforce server-side authorization check. Verify that the user has the 'admin' role.
    const { data: user, error: authError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .eq('status', 'active')
      .single() as { data: any; error: any };
      
    if (authError || !user || user.role !== 'admin') {
      console.log('Access denied to non-admin user:', userId);
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    // Test 1: Check if environment variables are loaded
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    // added
    const hasAnonKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    
    console.log('Environment variables:', {
      hasServiceKey,
      hasUrl,
      hasAnonKey,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    });
    
    // Test 2: Try to initialize Supabase client
    try {
      // Supabase client is already successfully initialized above for the authorization check
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.log('Failed to initialize Supabase client:', error);
      return NextResponse.json({ 
        error: 'Supabase client failed',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    
    // Test 3: Try to query the users table
    let userCount = 0;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, status')
        .limit(5);
      
      if (error) {
        console.log('Database query failed:', error);
        return NextResponse.json({ 
          error: 'Database query failed',
          details: error
        }, { status: 500 });
      }
      
      userCount = data?.length || 0;
      console.log('Database query successful, found users:', userCount);
      
    } catch (error) {
      console.log('Database query exception:', error);
      return NextResponse.json({ 
        error: 'Database query exception',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    
    // Test 4: Check if bcrypt is available
    let bcryptAvailable = false;
    try {
      const bcrypt = await import('bcrypt');
      bcryptAvailable = true;
      console.log('bcrypt library is available');
    } catch (error) {
      console.log('bcrypt library not available:', error);
    }
    
    console.log('=== TEST ENDPOINT SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      environment: {
        hasServiceKey,
        hasUrl,
        hasAnonKey,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      supabase: 'initialized',
      database: {
        connection: 'successful',
        userCount
      },
      bcrypt: {
        available: bcryptAvailable
      }
    });
    
  } catch (error) {
    console.log('=== TEST ENDPOINT FAILED ===');
    console.log('Exception caught:', error);
    console.log('Error type:', typeof error);
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error type');
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
