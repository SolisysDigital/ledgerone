/**
 * Session utilities for getting current user from session cookies
 * Used by RLS policies and API routes
 */

import { cookies } from 'next/headers';

export interface SessionData {
  uid: string;
  ts: number;
}

/**
 * Get current user ID from session cookie
 * Returns null if no valid session
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return null;
    }

    // Decode session cookie
    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    );

    const { uid, ts } = sessionData;

    // Check if session is not too old (24 hours)
    const sessionAge = Date.now() - ts;
    const maxAge = 24 * 60 * 60 * 1000;

    if (sessionAge > maxAge) {
      return null;
    }

    return uid;
  } catch (error) {
    console.error('Error getting current user ID from session:', error);
    return null;
  }
}

/**
 * Set session variable for RLS policies
 * This allows RLS policies to access the current user ID
 */
export async function setSessionVariableForRLS(supabase: any, userId: string): Promise<void> {
  try {
    // Set a session variable that RLS policies can access
    // Note: This requires the get_current_user_id() function to work
    // For now, we'll use a different approach - pass user_id in queries
    // The RLS policies will be updated to work with this approach
  } catch (error) {
    console.error('Error setting session variable for RLS:', error);
  }
}
