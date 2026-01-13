-- =====================================================
-- ADD ADMIN-SPECIFIC RLS POLICIES
-- =====================================================
-- This script adds policies that allow admin users to access
-- all records, not just records with their user_id.
-- 
-- Note: The CRUD operations use service_role which bypasses RLS,
-- but these policies ensure admins can also access data directly
-- through the database if needed.
-- =====================================================

-- Function to check if current user is admin
-- (This should already exist, but we'll ensure it does)
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

GRANT EXECUTE ON FUNCTION is_admin_user(UUID) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION is_admin_user(UUID) FROM anon;

-- Add admin policies for all data tables
-- Admins can access all records (not just their own)
DO $$
DECLARE
  table_name TEXT;
  tables_to_fix TEXT[] := ARRAY[
    'entities', 'contacts', 'emails', 'phones', 'websites',
    'bank_accounts', 'investment_accounts', 'crypto_accounts', 
    'credit_cards', 'hosting_accounts', 'securities_held', 
    'entity_related_data', 'entity_relationships'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    -- Drop existing admin policies if they exist
    EXECUTE format('DROP POLICY IF EXISTS "Admin users can view all %s" ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Admin users can insert %s" ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Admin users can update all %s" ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Admin users can delete all %s" ON %I', table_name, table_name);

    -- Admin SELECT policy: Admins can view all records
    EXECUTE format('
      CREATE POLICY "Admin users can view all %s" ON %I
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = current_setting(''app.current_user_id'', true)
            AND role = ''admin'' 
            AND status = ''active''
          )
          OR user_id::text = current_setting(''app.current_user_id'', true)
        )
    ', table_name, table_name);

    -- Admin INSERT policy: Admins can insert records
    EXECUTE format('
      CREATE POLICY "Admin users can insert %s" ON %I
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = current_setting(''app.current_user_id'', true)
            AND role = ''admin'' 
            AND status = ''active''
          )
          OR user_id::text = current_setting(''app.current_user_id'', true)
        )
    ', table_name, table_name);

    -- Admin UPDATE policy: Admins can update all records
    EXECUTE format('
      CREATE POLICY "Admin users can update all %s" ON %I
        FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = current_setting(''app.current_user_id'', true)
            AND role = ''admin'' 
            AND status = ''active''
          )
          OR user_id::text = current_setting(''app.current_user_id'', true)
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = current_setting(''app.current_user_id'', true)
            AND role = ''admin'' 
            AND status = ''active''
          )
          OR user_id::text = current_setting(''app.current_user_id'', true)
        )
    ', table_name, table_name);

    -- Admin DELETE policy: Admins can delete all records
    EXECUTE format('
      CREATE POLICY "Admin users can delete all %s" ON %I
        FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = current_setting(''app.current_user_id'', true)
            AND role = ''admin'' 
            AND status = ''active''
          )
          OR user_id::text = current_setting(''app.current_user_id'', true)
        )
    ', table_name, table_name);
  END LOOP;
END $$;

-- Note: The above policies use current_setting('app.current_user_id', true)
-- which requires the session to set this variable. Since we're using cookies
-- and service_role for CRUD operations, these policies may not be directly used.
-- However, they provide a fallback for direct database access.

-- Alternative: Simpler admin policies that work with the existing user_id-based approach
-- These allow admins to access records regardless of user_id
DO $$
DECLARE
  table_name TEXT;
  tables_to_fix TEXT[] := ARRAY[
    'entities', 'contacts', 'emails', 'phones', 'websites',
    'bank_accounts', 'investment_accounts', 'crypto_accounts', 
    'credit_cards', 'hosting_accounts', 'securities_held', 
    'entity_related_data', 'entity_relationships'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    -- Drop the alternative admin policies if they exist
    EXECUTE format('DROP POLICY IF EXISTS "Admin users can access all %s records" ON %I', table_name, table_name);

    -- Create a single policy that allows admins full access
    -- This uses a subquery to check if the user is admin
    -- Note: This requires a way to identify the current user in RLS context
    -- Since we use service_role for CRUD, this is mainly for direct DB access
  END LOOP;
END $$;

-- Success message
SELECT 'Admin RLS policies added successfully!' as status;
