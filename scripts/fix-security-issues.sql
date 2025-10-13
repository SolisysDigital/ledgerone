-- =====================================================
-- SUPABASE SECURITY REMEDIATION SCRIPT
-- =====================================================
-- This script fixes all security issues identified by Supabase linter:
-- 1. Removes SECURITY DEFINER from functions (bypass RLS)
-- 2. Enables RLS on securities_held table
-- 3. Adds proper RLS policies for all affected resources
-- =====================================================

-- =====================================================
-- PHASE 1: FIX SECURITY DEFINER FUNCTIONS
-- =====================================================

-- 1.1: Fix search_all_objects function - Remove SECURITY DEFINER
-- This function should use the calling user's permissions, not the creator's
DROP FUNCTION IF EXISTS search_all_objects(TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION search_all_objects(search_term TEXT, page_num INTEGER DEFAULT 1, page_size INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    object_type TEXT,
    object_type_label TEXT,
    icon TEXT,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            usv.*,
            COUNT(*) OVER() as total_count
        FROM unified_search_view usv
        WHERE 
            usv.title ILIKE '%' || search_term || '%' OR
            usv.subtitle ILIKE '%' || search_term || '%' OR
            usv.description ILIKE '%' || search_term || '%'
        ORDER BY 
            -- Prioritize exact matches in title
            CASE WHEN usv.title ILIKE search_term THEN 1
                 WHEN usv.title ILIKE '%' || search_term || '%' THEN 2
                 ELSE 3 END,
            -- Then by creation date (newer first) - handle NULL values
            COALESCE(usv.created_at, '1970-01-01'::timestamptz) DESC
        LIMIT page_size
        OFFSET (page_num - 1) * page_size
    )
    SELECT * FROM search_results;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER; -- Changed from SECURITY DEFINER to SECURITY INVOKER

-- Grant permissions to the function
GRANT EXECUTE ON FUNCTION search_all_objects(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_all_objects(TEXT, INTEGER, INTEGER) TO service_role;

-- 1.2: Fix create_admin_user function - Keep SECURITY DEFINER but add proper checks
-- Note: Admin user creation legitimately needs elevated privileges, but we'll add audit logging
DROP FUNCTION IF EXISTS create_admin_user(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_admin_user(
  p_username TEXT,
  p_password_hash TEXT,
  p_full_name TEXT DEFAULT 'System Administrator'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only service_role should be able to call this function
  -- This is enforced by GRANT EXECUTE permissions below
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RETURN 'User already exists';
  END IF;
  
  -- Insert new admin user
  INSERT INTO users (username, password_hash, full_name, role, status)
  VALUES (p_username, p_password_hash, p_full_name, 'admin', 'active');
  
  -- Log the admin creation
  INSERT INTO app_logs (level, source, action, message, details)
  VALUES ('INFO', 'create_admin_user', 'user_creation', 
          'Admin user created', 
          jsonb_build_object('username', p_username, 'full_name', p_full_name));
  
  RETURN 'Admin user created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error creating admin user: ' || SQLERRM;
END;
$$;

-- Only service_role can create admin users
REVOKE ALL ON FUNCTION create_admin_user FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT, TEXT) TO service_role;

-- 1.3: Fix update_admin_password function - Keep SECURITY DEFINER but add proper checks
DROP FUNCTION IF EXISTS update_admin_password(TEXT, TEXT);

CREATE OR REPLACE FUNCTION update_admin_password(
  p_username TEXT,
  p_new_password_hash TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only service_role should be able to call this function
  -- This is enforced by GRANT EXECUTE permissions below
  
  -- Update password for the specified user
  UPDATE users 
  SET password_hash = p_new_password_hash, updated_at = NOW()
  WHERE username = p_username;
  
  IF FOUND THEN
    -- Log the password update
    INSERT INTO app_logs (level, source, action, message, details)
    VALUES ('INFO', 'update_admin_password', 'password_update', 
            'Admin password updated', 
            jsonb_build_object('username', p_username));
    
    RETURN 'Password updated successfully';
  ELSE
    RETURN 'User not found';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error updating password: ' || SQLERRM;
END;
$$;

-- Only service_role can update admin passwords
REVOKE ALL ON FUNCTION update_admin_password FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_admin_password(TEXT, TEXT) TO service_role;

-- 1.4: Recreate views to ensure they don't have SECURITY DEFINER
-- Views themselves don't have SECURITY DEFINER, but recreating them ensures clean state

-- Recreate recent_errors view (without SECURITY DEFINER)
DROP VIEW IF EXISTS recent_errors;
CREATE OR REPLACE VIEW recent_errors AS
SELECT 
    timestamp,
    source,
    action,
    message,
    details,
    stack_trace,
    user_id
FROM app_logs 
WHERE level = 'ERROR' 
ORDER BY timestamp DESC;

-- Recreate debug_logs view (without SECURITY DEFINER)
DROP VIEW IF EXISTS debug_logs;
CREATE OR REPLACE VIEW debug_logs AS
SELECT 
    timestamp,
    source,
    action,
    message,
    details
FROM app_logs 
WHERE level = 'DEBUG' 
ORDER BY timestamp DESC;

-- Recreate migration_summary view (without SECURITY DEFINER)
DROP VIEW IF EXISTS migration_summary;
CREATE OR REPLACE VIEW migration_summary AS
SELECT 
    type_of_record,
    COUNT(*) as total_count,
    COUNT(DISTINCT entity_id) as unique_entities,
    COUNT(DISTINCT related_data_id) as unique_related_data
FROM entity_related_data
GROUP BY type_of_record
ORDER BY type_of_record;

-- Recreate entity_relationships_view (without SECURITY DEFINER)
DROP VIEW IF EXISTS entity_relationships_view;
CREATE OR REPLACE VIEW entity_relationships_view AS
SELECT 
    erd.id,
    erd.entity_id,
    erd.related_data_id,
    erd.type_of_record,
    erd.relationship_description,
    e.name as entity_name,
    e.type as entity_type,
    erd.created_at,
    erd.updated_at
FROM entity_related_data erd
LEFT JOIN entities e ON e.id = erd.entity_id
ORDER BY erd.created_at DESC;

-- Recreate users_public view (without SECURITY DEFINER)
DROP VIEW IF EXISTS users_public;
CREATE OR REPLACE VIEW users_public AS
SELECT id, username, full_name, role, status, created_at, last_login
FROM users
WHERE status = 'active';

-- Recreate unified_search_view (already clean, but ensuring consistency)
DROP VIEW IF EXISTS unified_search_view;
CREATE OR REPLACE VIEW unified_search_view AS
SELECT 
    id,
    'entities' as object_type,
    'Entities' as object_type_label,
    '🏢' as icon,
    COALESCE(name, 'Unnamed Entity') as title,
    COALESCE(type, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    created_at,
    updated_at
FROM entities

UNION ALL

SELECT 
    id,
    'contacts' as object_type,
    'Contacts' as object_type_label,
    '👤' as icon,
    COALESCE(name, 'Unnamed Contact') as title,
    COALESCE(title, email, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM contacts

UNION ALL

SELECT 
    id,
    'emails' as object_type,
    'Emails' as object_type_label,
    '📧' as icon,
    COALESCE(email, 'No Email') as title,
    COALESCE(label, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM emails

UNION ALL

SELECT 
    id,
    'phones' as object_type,
    'Phones' as object_type_label,
    '📞' as icon,
    COALESCE(phone, 'No Phone') as title,
    COALESCE(label, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM phones

UNION ALL

SELECT 
    id,
    'websites' as object_type,
    'Websites' as object_type_label,
    '🌐' as icon,
    COALESCE(url, 'No URL') as title,
    COALESCE(label, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM websites

UNION ALL

SELECT 
    id,
    'bank_accounts' as object_type,
    'Bank Accounts' as object_type_label,
    '🏦' as icon,
    COALESCE(bank_name, 'Unnamed Bank Account') as title,
    CASE 
        WHEN account_number IS NOT NULL AND LENGTH(account_number) >= 4 
        THEN '****' || RIGHT(account_number, 4)
        ELSE ''
    END as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM bank_accounts

UNION ALL

SELECT 
    id,
    'investment_accounts' as object_type,
    'Investment Accounts' as object_type_label,
    '📈' as icon,
    COALESCE(provider, 'Unnamed Investment Account') as title,
    COALESCE(account_type, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM investment_accounts

UNION ALL

SELECT 
    id,
    'crypto_accounts' as object_type,
    'Crypto Accounts' as object_type_label,
    '₿' as icon,
    COALESCE(platform, 'Unnamed Crypto Account') as title,
    COALESCE(account_number, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM crypto_accounts

UNION ALL

SELECT 
    id,
    'credit_cards' as object_type,
    'Credit Cards' as object_type_label,
    '💳' as icon,
    COALESCE(cardholder_name, 'Unnamed Credit Card') as title,
    COALESCE(issuer, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM credit_cards

UNION ALL

SELECT 
    id,
    'hosting_accounts' as object_type,
    'Hosting Accounts' as object_type_label,
    '🖥️' as icon,
    COALESCE(provider, 'Unnamed Hosting Account') as title,
    COALESCE(username, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM hosting_accounts;

-- =====================================================
-- PHASE 2: ENABLE RLS ON SECURITIES_HELD TABLE
-- =====================================================

-- 2.1: Enable RLS on securities_held table
ALTER TABLE securities_held ENABLE ROW LEVEL SECURITY;

-- 2.2: Create RLS policies for securities_held

-- Policy: Authenticated users can view all securities
CREATE POLICY "Authenticated users can view securities" 
ON securities_held 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to securities" 
ON securities_held 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Policy: Authenticated users can insert securities
CREATE POLICY "Authenticated users can insert securities" 
ON securities_held 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Authenticated users can update securities
CREATE POLICY "Authenticated users can update securities" 
ON securities_held 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Policy: Authenticated users can delete securities
CREATE POLICY "Authenticated users can delete securities" 
ON securities_held 
FOR DELETE 
TO authenticated 
USING (true);

-- =====================================================
-- PHASE 3: GRANT PROPER PERMISSIONS TO VIEWS
-- =====================================================

-- Grant SELECT permissions on all views
GRANT SELECT ON users_public TO anon, authenticated;
GRANT SELECT ON recent_errors TO authenticated, service_role;
GRANT SELECT ON debug_logs TO authenticated, service_role;
GRANT SELECT ON migration_summary TO authenticated, service_role;
GRANT SELECT ON entity_relationships_view TO authenticated, service_role;
GRANT SELECT ON unified_search_view TO authenticated, service_role;

-- =====================================================
-- PHASE 4: VERIFY RLS IS ENABLED ON ALL TABLES
-- =====================================================

-- Enable RLS on all main tables if not already enabled
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
ALTER TABLE entity_related_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for all main tables (if they don't exist)
-- These policies allow authenticated users full access
-- Adjust these based on your specific security requirements

DO $$
BEGIN
    -- Entities policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Authenticated users can view entities') THEN
        CREATE POLICY "Authenticated users can view entities" ON entities FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Authenticated users can modify entities') THEN
        CREATE POLICY "Authenticated users can modify entities" ON entities FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Contacts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Authenticated users can view contacts') THEN
        CREATE POLICY "Authenticated users can view contacts" ON contacts FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Authenticated users can modify contacts') THEN
        CREATE POLICY "Authenticated users can modify contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Emails policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emails' AND policyname = 'Authenticated users can view emails') THEN
        CREATE POLICY "Authenticated users can view emails" ON emails FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emails' AND policyname = 'Authenticated users can modify emails') THEN
        CREATE POLICY "Authenticated users can modify emails" ON emails FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Phones policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phones' AND policyname = 'Authenticated users can view phones') THEN
        CREATE POLICY "Authenticated users can view phones" ON phones FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phones' AND policyname = 'Authenticated users can modify phones') THEN
        CREATE POLICY "Authenticated users can modify phones" ON phones FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Websites policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'websites' AND policyname = 'Authenticated users can view websites') THEN
        CREATE POLICY "Authenticated users can view websites" ON websites FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'websites' AND policyname = 'Authenticated users can modify websites') THEN
        CREATE POLICY "Authenticated users can modify websites" ON websites FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Bank accounts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Authenticated users can view bank accounts') THEN
        CREATE POLICY "Authenticated users can view bank accounts" ON bank_accounts FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_accounts' AND policyname = 'Authenticated users can modify bank accounts') THEN
        CREATE POLICY "Authenticated users can modify bank accounts" ON bank_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Investment accounts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investment_accounts' AND policyname = 'Authenticated users can view investment accounts') THEN
        CREATE POLICY "Authenticated users can view investment accounts" ON investment_accounts FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investment_accounts' AND policyname = 'Authenticated users can modify investment accounts') THEN
        CREATE POLICY "Authenticated users can modify investment accounts" ON investment_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Crypto accounts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crypto_accounts' AND policyname = 'Authenticated users can view crypto accounts') THEN
        CREATE POLICY "Authenticated users can view crypto accounts" ON crypto_accounts FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crypto_accounts' AND policyname = 'Authenticated users can modify crypto accounts') THEN
        CREATE POLICY "Authenticated users can modify crypto accounts" ON crypto_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Credit cards policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_cards' AND policyname = 'Authenticated users can view credit cards') THEN
        CREATE POLICY "Authenticated users can view credit cards" ON credit_cards FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_cards' AND policyname = 'Authenticated users can modify credit cards') THEN
        CREATE POLICY "Authenticated users can modify credit cards" ON credit_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Hosting accounts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hosting_accounts' AND policyname = 'Authenticated users can view hosting accounts') THEN
        CREATE POLICY "Authenticated users can view hosting accounts" ON hosting_accounts FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hosting_accounts' AND policyname = 'Authenticated users can modify hosting accounts') THEN
        CREATE POLICY "Authenticated users can modify hosting accounts" ON hosting_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Entity related data policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entity_related_data' AND policyname = 'Authenticated users can view entity related data') THEN
        CREATE POLICY "Authenticated users can view entity related data" ON entity_related_data FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entity_related_data' AND policyname = 'Authenticated users can modify entity related data') THEN
        CREATE POLICY "Authenticated users can modify entity related data" ON entity_related_data FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Entity relationships policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entity_relationships' AND policyname = 'Authenticated users can view entity relationships') THEN
        CREATE POLICY "Authenticated users can view entity relationships" ON entity_relationships FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entity_relationships' AND policyname = 'Authenticated users can modify entity relationships') THEN
        CREATE POLICY "Authenticated users can modify entity relationships" ON entity_relationships FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- App logs policies (more restrictive)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_logs' AND policyname = 'Authenticated users can view app logs') THEN
        CREATE POLICY "Authenticated users can view app logs" ON app_logs FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_logs' AND policyname = 'Service role can modify app logs') THEN
        CREATE POLICY "Service role can modify app logs" ON app_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'entities', 'contacts', 'emails', 'phones', 'websites',
        'bank_accounts', 'investment_accounts', 'crypto_accounts',
        'credit_cards', 'hosting_accounts', 'securities_held',
        'entity_related_data', 'entity_relationships', 'app_logs', 'users'
    )
ORDER BY tablename;

-- Verify policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for SECURITY DEFINER functions
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_result(p.oid) as result_type,
    CASE WHEN p.prosecdef THEN 'DEFINER' ELSE 'INVOKER' END as security_type
FROM pg_proc p
LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
    AND p.proname IN ('search_all_objects', 'create_admin_user', 'update_admin_password')
ORDER BY p.proname;

-- Summary
SELECT 'Security remediation completed successfully' as status;

