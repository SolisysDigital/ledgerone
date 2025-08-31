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
      entity_related_data: {
        Row: {
          id: string;
          entity_id: string;
          related_data_id: string;
          type_of_record: string;
          relationship_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_id: string;
          related_data_id: string;
          type_of_record: string;
          relationship_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_id?: string;
          related_data_id?: string;
          type_of_record?: string;
          relationship_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_logs: {
        Row: {
          id: string;
          level: string;
          source: string;
          action: string;
          message: string;
          details: any | null;
          stack_trace: string | null;
          user_id: string | null;
          session_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          timestamp: string;
          // Legacy/alternative field names
          created_at?: string;
          log_level?: string;
          source_name?: string;
          action_name?: string;
          error_message?: string;
          error_details?: any | null;
          metadata?: any | null;
          error_stack?: string | null;
          userId?: string | null;
        };
        Insert: {
          id?: string;
          level: string;
          source: string;
          action: string;
          message: string;
          details?: any | null;
          stack_trace?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          timestamp?: string;
          // Legacy/alternative field names
          created_at?: string;
          log_level?: string;
          source_name?: string;
          action_name?: string;
          error_message?: string;
          error_details?: any | null;
          metadata?: any | null;
          error_stack?: string | null;
          userId?: string | null;
        };
        Update: {
          id?: string;
          level?: string;
          source?: string;
          action?: string;
          message?: string;
          details?: any | null;
          stack_trace?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          timestamp?: string;
          // Legacy/alternative field names
          created_at?: string;
          log_level?: string;
          source_name?: string;
          action_name?: string;
          error_message?: string;
          error_details?: any | null;
          metadata?: any | null;
          error_stack?: string | null;
          userId?: string | null;
        };
      };
      entities: {
        Row: {
          id: string;
          name: string;
          type: string;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          title: string | null;
          email: string | null;
          phone: string | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          title?: string | null;
          email?: string | null;
          phone?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          title?: string | null;
          email?: string | null;
          phone?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      phones: {
        Row: {
          id: string;
          phone: string;
          label: string | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          phone: string;
          label?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          phone?: string;
          label?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      emails: {
        Row: {
          id: string;
          email: string;
          label: string | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          label?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          label?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      websites: {
        Row: {
          id: string;
          url: string;
          label: string | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          url: string;
          label?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          url?: string;
          label?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      bank_accounts: {
        Row: {
          id: string;
          bank_name: string;
          account_number: string | null;
          routing_number: string | null;
          institution_held_at: string | null;
          purpose: string | null;
          last_balance: number | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          bank_name: string;
          account_number?: string | null;
          routing_number?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          bank_name?: string;
          account_number?: string | null;
          routing_number?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      investment_accounts: {
        Row: {
          id: string;
          provider: string;
          account_type: string | null;
          account_number: string | null;
          institution_held_at: string | null;
          purpose: string | null;
          last_balance: number | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          provider: string;
          account_type?: string | null;
          account_number?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          provider?: string;
          account_type?: string | null;
          account_number?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      crypto_accounts: {
        Row: {
          id: string;
          platform: string;
          account_number: string | null;
          wallet_address: string | null;
          institution_held_at: string | null;
          purpose: string | null;
          last_balance: number | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          platform: string;
          account_number?: string | null;
          wallet_address?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          platform?: string;
          account_number?: string | null;
          wallet_address?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      credit_cards: {
        Row: {
          id: string;
          cardholder_name: string;
          card_number: string | null;
          issuer: string | null;
          type: string | null;
          institution_held_at: string | null;
          purpose: string | null;
          last_balance: number | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          cardholder_name: string;
          card_number?: string | null;
          issuer?: string | null;
          type?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          cardholder_name?: string;
          card_number?: string | null;
          issuer?: string | null;
          type?: string | null;
          institution_held_at?: string | null;
          purpose?: string | null;
          last_balance?: number | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      hosting_accounts: {
        Row: {
          id: string;
          provider: string;
          login_url: string | null;
          username: string | null;
          short_description: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          provider: string;
          login_url?: string | null;
          username?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          provider?: string;
          login_url?: string | null;
          username?: string | null;
          short_description?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      entity_relationships: {
        Row: {
          id: string;
          from_entity_id: string;
          to_entity_id: string;
          relationship_type: string;
          relationship_description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          from_entity_id: string;
          to_entity_id: string;
          relationship_type: string;
          relationship_description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          from_entity_id?: string;
          to_entity_id?: string;
          relationship_type?: string;
          relationship_description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
    };
    Functions: {
      insert_app_log: {
        Args: {
          p_level: string;
          p_source: string;
          p_action: string;
          p_message: string;
          p_details?: any;
          p_stack_trace?: string;
          p_user_id?: string;
          p_session_id?: string;
          p_ip_address?: string;
          p_user_agent?: string;
        };
        Returns: { id: string };
      };
    };
  };
};
