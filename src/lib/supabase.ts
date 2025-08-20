import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // During build time or when environment variables are not available,
    // return a mock client to prevent build failures
    if (!supabaseUrl || !supabaseAnonKey) {
      if (typeof window === 'undefined') {
        // Server-side during build - return a mock client
        console.warn('Supabase environment variables not configured - using mock client for build');
        return createMockSupabaseClient();
      } else {
        // Client-side - throw error for actual runtime
        throw new Error('Supabase environment variables are not configured');
      }
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

function createMockSupabaseClient() {
  // Create a mock client that returns empty results for build time
  const mockClient = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
      eq: function(this: any) { return this; },
      neq: function(this: any) { return this; },
      gt: function(this: any) { return this; },
      gte: function(this: any) { return this; },
      lt: function(this: any) { return this; },
      lte: function(this: any) { return this; },
      like: function(this: any) { return this; },
      ilike: function(this: any) { return this; },
      is: function(this: any) { return this; },
      in: function(this: any) { return this; },
      contains: function(this: any) { return this; },
      containedBy: function(this: any) { return this; },
      rangeGt: function(this: any) { return this; },
      rangeGte: function(this: any) { return this; },
      rangeLt: function(this: any) { return this; },
      rangeLte: function(this: any) { return this; },
      rangeAdjacent: function(this: any) { return this; },
      overlaps: function(this: any) { return this; },
      textSearch: function(this: any) { return this; },
      match: function(this: any) { return this; },
      not: function(this: any) { return this; },
      filter: function(this: any) { return this; },
      order: function(this: any) { return this; },
      limit: function(this: any) { return this; },
      range: function(this: any) { return this; },
      abortSignal: function(this: any) { return this; },
    }),
    rpc: () => ({ data: null, error: null }),
    auth: {
      getUser: () => ({ data: { user: null }, error: null }),
      getSession: () => ({ data: { session: null }, error: null }),
      signOut: () => ({ error: null }),
      signInWithPassword: () => ({ data: { user: null, session: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: null }),
        download: () => ({ data: null, error: null }),
        remove: () => ({ data: null, error: null }),
        createSignedUrl: () => ({ data: null, error: null }),
      }),
    },
  };
  
  return mockClient as any;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  }
});