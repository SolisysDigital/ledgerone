import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

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

    // Log to admin logs using the service role
    let logResult;
    switch (level.toLowerCase()) {
      case 'error':
        logResult = await AppLogger.error(source, action, message, null, details);
        break;
      case 'warning':
        logResult = await AppLogger.warning(source, action, message, details);
        break;
      case 'info':
        logResult = await AppLogger.info(source, action, message, details);
        break;
      case 'debug':
        logResult = await AppLogger.debug(source, action, message, details);
        break;
      default:
        logResult = await AppLogger.info(source, action, message, details);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Log entry created successfully' 
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
