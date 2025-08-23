// Temporary database types - replace with generated types from Supabase
// To generate proper types, run:
// npx supabase gen types typescript --project-id "$PROJECT_REF" > src/lib/database.types.ts

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          full_name: string | null;
          role: 'admin' | 'editor' | 'viewer';
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          full_name?: string | null;
          role?: 'admin' | 'editor' | 'viewer';
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          full_name?: string | null;
          role?: 'admin' | 'editor' | 'viewer';
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other tables as needed
      entities: {
        Row: {
          id: string;
          name: string;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
    };
    Functions: {
      create_admin_user: {
        Args: {
          p_username: string;
          p_password_hash: string;
          p_full_name?: string;
        };
        Returns: string;
      };
      update_admin_password: {
        Args: {
          p_username: string;
          p_new_password_hash: string;
        };
        Returns: string;
      };
    };
  };
};
