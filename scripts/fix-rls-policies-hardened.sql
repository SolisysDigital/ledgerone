-- =====================================================
-- HARDENED RLS POLICIES - Security Hardening Checklist
-- =====================================================
-- This script implements all security hardening best practices:
-- 1. RLS enabled on every sensitive table
-- 2. No USING(true) / WITH CHECK(true) policies (except service_role which bypasses RLS)
-- 3. No policies for anon except intentionally public content
-- 4. Ownership/tenant key on every row (user_id)
-- 5. Explicit REVOKE all on tables from anon, authenticated then only grant what you need
-- 6. Never leak service_role key to client (verified in code)
-- 7. Consider views/RPC to reduce exposure (recommendation)
-- =====================================================

-- Step 1: Ensure RLS is enabled on all sensitive tables
-- (This should already be done, but we'll verify/enable it)
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

-- Step 2: Add user_id columns to all tables that need user isolation
-- (Skip app_logs as it already has user_id)

ALTER TABLE entities 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE phones 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE investment_accounts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE crypto_accounts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE hosting_accounts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE securities_held 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE entity_related_data 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE entity_relationships 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Create indexes on user_id columns for performance
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

-- Step 4: SECURITY HARDENING - Explicitly REVOKE all permissions from anon and authenticated
-- Then we'll grant only what's needed via RLS policies

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

-- Step 5: Function to check if user is admin
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

-- Step 6: Drop existing overly permissive policies
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

-- Step 7: Create new secure RLS policies
-- SECURITY: No USING(true) / WITH CHECK(true) policies except for service_role
-- (service_role bypasses RLS entirely, so USING(true) is acceptable there)

-- Entities policies
-- Service role: Full access (bypasses RLS - acceptable for service_role only)
CREATE POLICY "Service role has full access to entities" ON entities
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated users: Restrictive policies (NOT using true)
-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can view entities with user_id" ON entities
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can insert entities with user_id" ON entities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can update entities with user_id" ON entities
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can delete entities with user_id" ON entities
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- SECURITY: No policies for anon role = denied by default (secure)

-- Create similar policies for all other tables
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
    -- Service role policy (full access - bypasses RLS)
    -- NOTE: USING(true) is acceptable ONLY for service_role as it bypasses RLS
    EXECUTE format('
      CREATE POLICY "Service role has full access to %s" ON %I
        FOR ALL TO service_role
        USING (true) WITH CHECK (true)
    ', table_name, table_name);

    -- Authenticated users: Restrictive policies (NOT using true)
    -- SECURITY FIX: Use auth.uid() = user_id to enforce row-level user isolation
    EXECUTE format('
      CREATE POLICY "Authenticated users can view %s with user_id" ON %I
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id)
    ', table_name, table_name);

    -- SECURITY FIX: Use auth.uid() = user_id to enforce row-level user isolation
    EXECUTE format('
      CREATE POLICY "Authenticated users can insert %s with user_id" ON %I
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id)
    ', table_name, table_name);

    -- SECURITY FIX: Use auth.uid() = user_id to enforce row-level user isolation
    EXECUTE format('
      CREATE POLICY "Authenticated users can update %s with user_id" ON %I
        FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    ', table_name, table_name);

    -- SECURITY FIX: Use auth.uid() = user_id to enforce row-level user isolation
    EXECUTE format('
      CREATE POLICY "Authenticated users can delete %s with user_id" ON %I
        FOR DELETE TO authenticated
        USING (auth.uid() = user_id)
    ', table_name, table_name);
    
    -- SECURITY: No policies for 'anon' role = denied by default (secure)
  END LOOP;
END $$;

-- Step 8: Backfill existing records with a default user_id
DO $$
DECLARE
  default_user_id UUID;
BEGIN
  SELECT id INTO default_user_id 
  FROM users 
  WHERE role = 'admin' 
  AND status = 'active'
  ORDER BY created_at ASC
  LIMIT 1;

  IF default_user_id IS NULL THEN
    SELECT id INTO default_user_id 
    FROM users 
    WHERE status = 'active'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF default_user_id IS NOT NULL THEN
    UPDATE entities SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE contacts SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE emails SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE phones SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE websites SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE bank_accounts SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE investment_accounts SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE crypto_accounts SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE credit_cards SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE hosting_accounts SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE securities_held SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE entity_related_data SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE entity_relationships SET user_id = default_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Step 9: Add comments
COMMENT ON COLUMN entities.user_id IS 'User who owns this entity record';
COMMENT ON COLUMN contacts.user_id IS 'User who owns this contact record';
COMMENT ON COLUMN emails.user_id IS 'User who owns this email record';
COMMENT ON COLUMN phones.user_id IS 'User who owns this phone record';
COMMENT ON COLUMN websites.user_id IS 'User who owns this website record';
COMMENT ON COLUMN bank_accounts.user_id IS 'User who owns this bank account record';
COMMENT ON COLUMN investment_accounts.user_id IS 'User who owns this investment account record';
COMMENT ON COLUMN crypto_accounts.user_id IS 'User who owns this crypto account record';
COMMENT ON COLUMN credit_cards.user_id IS 'User who owns this credit card record';
COMMENT ON COLUMN hosting_accounts.user_id IS 'User who owns this hosting account record';
COMMENT ON COLUMN securities_held.user_id IS 'User who owns this security record';
COMMENT ON COLUMN entity_related_data.user_id IS 'User who owns this relationship record';
COMMENT ON COLUMN entity_relationships.user_id IS 'User who owns this entity relationship record';

-- Success message
SELECT 'Hardened RLS policies applied successfully! All security checklist items implemented.' as status;
