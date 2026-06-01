import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';
// SECURITY FIX: Import session utility to inspect user authentication on server side
import { getCurrentUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, source, action, message, details } = body;

    // Validate required fields
    if (!level || !source || !action || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: level, source, action, message' 
      }, { status: 400 });
    }

    // SECURITY FIX: Enforce server-side user authentication. Anonymous logging is rejected to avoid DoS/Spam.
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Valid session required.' }, { status: 401 });
    }

    // SECURITY FIX: Directly insert the log using AppLogger.insertLog, binding the authenticated userId to ensure audit trail integrity
    const logData = {
      level: level.toUpperCase() as any,
      source,
      action,
      message,
      details,
      userId
    };

    const logResult = await AppLogger.insertLog(logData);

    return NextResponse.json({ 
      success: logResult.success, 
      message: logResult.success ? 'Log entry created successfully' : 'Log entry creation failed',
      logId: logResult.logId
    });

  } catch (error) {
    console.error('API: Error in log endpoint:', error);
    
    // Try to log this error as well
    try {
      await AppLogger.error('log_api', 'log_endpoint_failed', 'Failed to create log entry', error as Error, {
        originalRequest: request.body
      });
    } catch (logError) {
      console.error('Failed to log log endpoint error:', logError);
    }

    return NextResponse.json({
      error: 'Failed to create log entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
