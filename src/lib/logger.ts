import { getServiceSupabase } from './supabase';

export type LogLevel = 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';

export interface LogEntry {
  level: LogLevel;
  source: string;
  action: string;
  message: string;
  details?: Record<string, any>;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogResponse {
  success: boolean;
  logId?: string;
  error?: string;
}

/**
 * Logger utility for application-wide logging
 */
export class AppLogger {
  /**
   * Log an error with full details
   */
  static async error(
    source: string,
    action: string,
    message: string,
    error?: Error | any,
    details?: Record<string, any>
  ): Promise<LogResponse> {
    try {
      const stackTrace = error?.stack || error?.message || '';
      const logData: LogEntry = {
        level: 'ERROR',
        source,
        action,
        message,
        details: {
          ...details,
          errorMessage: error?.message,
          errorName: error?.name,
          ...(error && typeof error === 'object' && !(error instanceof Error) ? error : {})
        },
        stackTrace,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      };

      return await this.insertLog(logData);
    } catch (logError) {
      console.error('Failed to log error:', logError);
      return { success: false, error: 'Failed to log error' };
    }
  }

  /**
   * Log a warning
   */
  static async warning(
    source: string,
    action: string,
    message: string,
    details?: Record<string, any>
  ): Promise<LogResponse> {
    const logData: LogEntry = {
      level: 'WARNING',
      source,
      action,
      message,
      details
    };

    return await this.insertLog(logData);
  }

  /**
   * Log informational message
   */
  static async info(
    source: string,
    action: string,
    message: string,
    details?: Record<string, any>
  ): Promise<LogResponse> {
    const logData: LogEntry = {
      level: 'INFO',
      source,
      action,
      message,
      details
    };

    return await this.insertLog(logData);
  }

  /**
   * Log debug information
   */
  static async debug(
    source: string,
    action: string,
    message: string,
    details?: Record<string, any>
  ): Promise<LogResponse> {
    const logData: LogEntry = {
      level: 'DEBUG',
      source,
      action,
      message,
      details
    };

    return await this.insertLog(logData);
  }

  /**
   * Insert a log entry into the database
   */
  static async insertLog(logEntry: LogEntry): Promise<LogResponse> {
    try {
      // Use service role Supabase client to bypass RLS
      const supabase = getServiceSupabase();
      
      // Skip RPC call and use direct insert to avoid build failures
      const { data: insertData, error: insertError } = await supabase
        .from('app_logs')
        .insert({
          level: logEntry.level,
          source: logEntry.source,
          action: logEntry.action,
          message: logEntry.message,
          details: logEntry.details,
          stack_trace: logEntry.stackTrace,
          user_id: logEntry.userId,
          session_id: logEntry.sessionId,
          ip_address: logEntry.ipAddress,
          user_agent: logEntry.userAgent
        })
        .select('id')
        .single() as { data: { id: string } | null; error: any };

      if (insertError) {
        console.error('Direct insert error:', insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, logId: insertData?.id };
    } catch (error) {
      console.error('Logger error:', error);
      return { success: false, error: 'Logger failed' };
    }
  }

  /**
   * Get a specific log by ID
   */
  static async getLogById(logId: string) {
    try {
      // Use service role Supabase client to bypass RLS
      const supabase = getServiceSupabase();
      
      const { data, error } = await supabase
        .from('app_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get log by ID:', error);
      return null;
    }
  }

  /**
   * Get recent errors
   */
  static async getRecentErrors(limit: number = 50) {
    try {
      // Use service role Supabase client to bypass RLS
      const supabase = getServiceSupabase();
      
      const { data, error } = await supabase
        .from('app_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }

  /**
   * Get debug logs
   */
  static async getDebugLogs(limit: number = 50) {
    try {
      // Use service role Supabase client to bypass RLS
      const supabase = getServiceSupabase();
      
      const { data, error } = await supabase
        .from('debug_logs')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get debug logs:', error);
      return [];
    }
  }

  /**
   * Clear old logs (keep last 30 days)
   */
  static async clearOldLogs() {
    try {
      // Use service role Supabase client to bypass RLS
      const supabase = getServiceSupabase();
      
      const { error } = await supabase
        .from('app_logs')
        .delete()
        .lt('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to clear old logs:', error);
      return { success: false, error: error.message };
    }
  }
}

// Convenience functions for common logging scenarios
export const logFormSubmission = (source: string, data: any, error?: Error) => {
  if (error) {
    return AppLogger.error(source, 'form_submission', 'Form submission failed', error, { formData: data });
  } else {
    return AppLogger.info(source, 'form_submission', 'Form submitted successfully', { formData: data });
  }
};

export const logDatabaseOperation = (source: string, operation: string, data: any, error?: Error) => {
  if (error) {
    return AppLogger.error(source, `database_${operation}`, `Database ${operation} failed`, error, { data });
  } else {
    return AppLogger.info(source, `database_${operation}`, `Database ${operation} successful`, { data });
  }
};

export const logValidationError = (source: string, field: string, value: any, message: string) => {
  return AppLogger.warning(source, 'validation', `Validation failed for ${field}`, {
    field,
    value,
    message
  });
}; 