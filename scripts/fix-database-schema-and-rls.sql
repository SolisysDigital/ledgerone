-- =========================================================================
-- SECURITY FIX: LedgerOne Master Database Schema & RLS Hardening Script
-- This script aligns the remote Supabase database schema with the TypeScript 
-- configurations and enforces Row Level Security (RLS) data isolation rules.
-- =========================================================================

-- SECTION 0: CREATE MISSING SCHEMAS / TABLES
-- Build any database tables expected by the application that were missing in the base schema

-- SECURITY COMMENT: Create missing entity_relationships table to connect entities together
CREATE TABLE IF NOT EXISTS entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  to_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL,
  relationship_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE entity_relationships IS 'Junction table for entity-to-entity relationships';


-- SECTION 1: HARDEN SCHEMA BY ADDING MISSING COLUMNS
-- Add missing columns to support the forms and fields expected by tableConfigs.ts

-- SECURITY COMMENT: Add missing institution_held_at, purpose, last_balance, and user_id columns to bank_accounts
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 2);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add missing institution_held_at, purpose, last_balance, and user_id columns to investment_accounts
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 2);
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add missing institution_held_at, purpose, last_balance, and user_id columns to crypto_accounts
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 8);
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add missing card_number, issuer, type, institution_held_at, purpose, last_balance, and user_id columns to credit_cards
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS card_number VARCHAR(50);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS issuer VARCHAR(255);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 2);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add missing login_url, password, and user_id columns to hosting_accounts
ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS login_url VARCHAR(500);
ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;


-- SECTION 2: ADD USER_ID TO REMAINING TABLES
-- Ensure ownership references are present on all core tables for row isolation

-- SECURITY COMMENT: Add user_id reference to entities table
ALTER TABLE entities ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add user_id reference to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add user_id reference to emails table
ALTER TABLE emails ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add user_id reference to phones table
ALTER TABLE phones ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add user_id reference to websites table
ALTER TABLE websites ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add user_id reference to securities_held table
ALTER TABLE securities_held ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- SECURITY COMMENT: Add user_id reference to entity_related_data junction table
ALTER TABLE entity_related_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;


-- SECTION 3: CREATE INDEXES
-- Index user_id columns on all tables for optimal lookups and query efficiency

-- SECURITY COMMENT: Create indexes for user_id columns to optimize performance
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_phones_user_id ON phones(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_accounts_user_id ON investment_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_accounts_user_id ON crypto_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_accounts_user_id ON hosting_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_securities_held_user_id ON securities_held(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_related_data_user_id ON entity_related_data(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_user_id ON entity_relationships(user_id);


-- SECTION 4: ENABLE RLS ON ALL SENSITIVE TABLES
-- Ensure Row Level Security is active across all tables

-- SECURITY COMMENT: Force-enable Row Level Security on all private tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE securities_held ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_related_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;


-- SECTION 5: SECURITY HARDENING - REVOKE AND GRANT DEFINITIONS
-- Restrict anonymous role completely and govern authenticated role with RLS policies

-- SECURITY COMMENT: Perform explicit permission revokes and grants
DO $$
DECLARE
  table_name TEXT;
  tables_to_harden TEXT[] := ARRAY[
    'entities', 'contacts', 'emails', 'phones', 'websites',
    'bank_accounts', 'investment_accounts', 'crypto_accounts', 
    'credit_cards', 'hosting_accounts', 'securities_held', 
    'entity_related_data', 'entity_relationships', 'users', 'user_permissions', 'app_logs'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_harden
  LOOP
    -- Revoke all permissions from anon (explicit denial)
    EXECUTE format('REVOKE ALL ON TABLE %I FROM anon', table_name);
    
    -- Revoke all permissions from authenticated (explicit denial)
    EXECUTE format('REVOKE ALL ON TABLE %I FROM authenticated', table_name);
    
    -- Grant CRUD permissions to service_role role explicitly
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO service_role', table_name);
  END LOOP;
END $$;


-- SECTION 6: IS_ADMIN FUNCTION
-- Create admin helper function

-- SECURITY COMMENT: Create is_admin_user checker with SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_admin_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = p_user_id 
    AND role = 'admin' 
    AND status = 'active'
  );
END;
$$;

-- Secure function by revoking public execute privileges and granting to service_role only
REVOKE EXECUTE ON FUNCTION is_admin_user(UUID) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin_user(UUID) TO service_role;


-- SECTION 7: DROP OLD POLICIES
-- Clean up any existing policies on the target tables

-- SECURITY COMMENT: Drop existing policies before redefining
DO $$
DECLARE
  table_name TEXT;
  policy_name TEXT;
  tables_to_fix TEXT[] := ARRAY[
    'entities', 'contacts', 'emails', 'phones', 'websites',
    'bank_accounts', 'investment_accounts', 'crypto_accounts', 
    'credit_cards', 'hosting_accounts', 'securities_held', 
    'entity_related_data', 'entity_relationships'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    FOR policy_name IN 
      SELECT policyname FROM pg_policies WHERE tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    END LOOP;
  END LOOP;
END $$;


-- SECTION 8: DEFINE EXPLICIT AND SECURE RLS POLICIES
-- Policies ensure that authenticated users can only CRUD records with their own user_id.

-- SECURITY COMMENT: Define explicit row-level policies for the entities table
CREATE POLICY "Service role has full access to entities" ON entities
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view entities with user_id" ON entities
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert entities with user_id" ON entities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update entities with user_id" ON entities
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete entities with user_id" ON entities
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- SECURITY COMMENT: Define explicit row-level policies for the remaining core tables
DO $$
DECLARE
  table_name TEXT;
  tables_to_fix TEXT[] := ARRAY[
    'contacts', 'emails', 'phones', 'websites',
    'bank_accounts', 'investment_accounts', 'crypto_accounts', 
    'credit_cards', 'hosting_accounts', 'securities_held', 
    'entity_related_data', 'entity_relationships'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    -- Service role policy (full bypass)
    EXECUTE format('
      CREATE POLICY "Service role has full access to %s" ON %I
        FOR ALL TO service_role
        USING (true) WITH CHECK (true)
    ', table_name, table_name);

    -- Authenticated users select policy
    EXECUTE format('
      CREATE POLICY "Authenticated users can view %s with user_id" ON %I
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id)
    ', table_name, table_name);

    -- Authenticated users insert policy
    EXECUTE format('
      CREATE POLICY "Authenticated users can insert %s with user_id" ON %I
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id)
    ', table_name, table_name);

    -- Authenticated users update policy
    EXECUTE format('
      CREATE POLICY "Authenticated users can update %s with user_id" ON %I
        FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    ', table_name, table_name);

    -- Authenticated users delete policy
    EXECUTE format('
      CREATE POLICY "Authenticated users can delete %s with user_id" ON %I
        FOR DELETE TO authenticated
        USING (auth.uid() = user_id)
    ', table_name, table_name);
  END LOOP;
END $$;


-- SECTION 9: BACKFILL RECORDS
-- Backfill any existing records to the system administrator to maintain reference integrity

-- SECURITY COMMENT: Assign existing records without owners to the default admin user
DO $$
DECLARE
  default_user_id UUID;
  table_name TEXT;
  tables_to_backfill TEXT[] := ARRAY[
    'entities', 'contacts', 'emails', 'phones', 'websites',
    'bank_accounts', 'investment_accounts', 'crypto_accounts', 
    'credit_cards', 'hosting_accounts', 'securities_held', 
    'entity_related_data', 'entity_relationships'
  ];
BEGIN
  -- Get first admin user id
  SELECT id INTO default_user_id FROM users WHERE role = 'admin' AND status = 'active' LIMIT 1;
  
  -- Fallback if no admin exists
  IF default_user_id IS NULL THEN
    SELECT id INTO default_user_id FROM users LIMIT 1;
  END IF;
  
  IF default_user_id IS NOT NULL THEN
    FOREACH table_name IN ARRAY tables_to_backfill
    LOOP
      EXECUTE format('UPDATE %I SET user_id = $1 WHERE user_id IS NULL', table_name) USING default_user_id;
    END LOOP;
  END IF;
END $$;


-- SECTION 10: RELOAD POSTGREST SCHEMA CACHE AND VERIFY
-- Force postgrest to re-scan the tables so the new columns are immediately queryable

-- SECURITY COMMENT: Notify PostgREST cache that the schema was modified
SELECT pg_notify('pgrst', 'reload schema');

SELECT 'LedgerOne schema updated & RLS policies hardened successfully!' AS status;
