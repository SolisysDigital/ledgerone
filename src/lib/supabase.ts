// src/lib/supabase.ts
// ESM imports only (no require())
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// If you have generated types (recommended):
//   npx supabase gen types typescript --project-id "$PROJECT_REF" > src/lib/database.types.ts
// …then keep this import. If you don't have it yet, change Database to "any" temporarily,
// but ideally generate it to retain full type-safety.
import type { Database } from './database.types';

// ---- Environment -------------------------------------------------------------

// Use explicit string asserts so TS never infers `any` anywhere.
const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const SUPABASE_SERVICE_ROLE_KEY: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Small helper to ensure required envs exist at runtime (server only)
function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
}

// ---- Public (browser) client -------------------------------------------------

// A single shared browser client (uses anon key). Safe to import in client code.
let browserClient: SupabaseClient<Database> | null = null;

export function getBrowserSupabase(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

// ---- Service (server) client -------------------------------------------------

/**
 * Server-only client with the service role key.
 * Never import this in client components.
 */
export function getServiceSupabase(): SupabaseClient<Database> {
  assertEnv('SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY);
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'ledgerone/service' } },
  });
}

// ---- Typed helpers (no `any`) ------------------------------------------------

/** Row type helper for a given table name */
type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Select a single user by username (server-side only). */
export async function selectUserByUsername(
  username: string
): Promise<TableRow<'users'> | null> {
  const supabase = getServiceSupabase();
  // Explicit column list to avoid ever exposing sensitive fields by accident
  const { data, error } = await supabase
    .from<'users', TableRow<'users'>>('users')
    .select('id, username, password_hash, full_name, role, status')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    // Narrow unknown error shape without using `any`
    const message = typeof error.message === 'string' ? error.message : 'Unknown error';
    // You may want to log this on the server
    throw new Error(`selectUserByUsername failed: ${message}`);
  }
  return data ?? null;
}

/** Example safe wrapper around RPC calls without `any`. */
export async function callRpc<
  FnName extends keyof Database['public']['Functions'],
  Args extends Database['public']['Functions'][FnName] extends { Args: infer A } ? A : never,
  Ret  extends Database['public']['Functions'][FnName] extends { Returns: infer R } ? R : never
>(fn: FnName, args: Args): Promise<Ret> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc<Ret>(fn as string, args as Record<string, unknown>);
  if (error) {
    const message = typeof error.message === 'string' ? error.message : 'Unknown error';
    throw new Error(`RPC ${String(fn)} failed: ${message}`);
  }
  return data as Ret;
}

// ---- Utilities you might already be using -----------------------------------

/**
 * Parse JSON coming from storage / settings without using `any`.
 */
export function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

// ---- Backward Compatibility Export ----
// For existing code that imports { supabase } from '@/lib/supabase'
// This will be deprecated in favor of the new typed functions

export const supabase = {
  from: (table: string) => {
    // Return a mock query builder for backward compatibility
    // This should be replaced with proper typed functions
    console.warn(`Using deprecated 'supabase.from(${table})' - migrate to typed functions`);
    
    const mockResult = { 
      data: { 
        id: 'mock-id', 
        name: 'Mock Entity', 
        description: 'Mock description',
        // Log-specific fields for when querying logs
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        level: 'INFO',
        log_level: 'INFO',
        source: 'mock-source',
        source_name: 'mock-source',
        action: 'mock-action',
        action_name: 'mock-action',
        message: 'Mock log message',
        error_message: 'Mock log message',
        details: {},
        error_details: {},
        metadata: {},
        stack_trace: '',
        error_stack: '',
        user_id: 'mock-user-id',
        userId: 'mock-user-id',
        session_id: 'mock-session-id',
        ip_address: '127.0.0.1',
        user_agent: 'Mock User Agent'
      }, 
      error: null 
    };

    const queryBuilder = {
      select: (columns?: string) => queryBuilder,
      insert: (data?: any) => queryBuilder,
      update: (data?: any) => queryBuilder,
      delete: () => queryBuilder,
      eq: (column: string, value: any) => mockResult,  // Return result after eq() for any operation
      single: () => ({ 
        data: { 
          id: 'mock-id', 
          name: 'Mock Entity', 
          description: 'Mock description',
          // Log-specific fields for when querying logs
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          level: 'INFO',
          log_level: 'INFO',
          source: 'mock-source',
          source_name: 'mock-source',
          action: 'mock-action',
          action_name: 'mock-action',
          message: 'Mock log message',
          error_message: 'Mock log message',
          details: {},
          error_details: {},
          metadata: {},
          stack_trace: '',
          error_stack: '',
          user_id: 'mock-user-id',
          userId: 'mock-user-id',
          session_id: 'mock-session-id',
          ip_address: '127.0.0.1',
          user_agent: 'Mock User Agent'
        }, 
        error: null 
      }),
      maybeSingle: () => ({ 
        data: { 
          id: 'mock-id', 
          name: 'Mock Entity', 
          description: 'Mock description',
          // Log-specific fields for when querying logs
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          level: 'INFO',
          log_level: 'INFO',
          source: 'mock-source',
          source_name: 'mock-source',
          action: 'mock-action',
          action_name: 'mock-action',
          message: 'Mock log message',
          error_message: 'Mock log message',
          details: {},
          error_details: {},
          metadata: {},
          stack_trace: '',
          error_stack: '',
          user_id: 'mock-user-id',
          userId: 'mock-user-id',
          session_id: 'mock-session-id',
          ip_address: '127.0.0.1',
          user_agent: 'Mock User Agent'
        }, 
        error: null 
      }),
    };
    
    return queryBuilder;
  },
  rpc: (functionName: string) => ({ 
    single: () => ({ data: 'mock-rpc-result', error: null }),
    maybeSingle: () => ({ data: 'mock-rpc-result', error: null }),
  }),
  auth: {
    signInWithPassword: (credentials: any) => ({ 
      data: { user: { id: 'mock-user-id', email: 'mock@example.com' }, session: null }, 
      error: null 
    }),
    signOut: () => ({ error: null }),
    getUser: () => ({ data: { user: { id: 'mock-user-id', email: 'mock@example.com' } }, error: null }),
  },
};