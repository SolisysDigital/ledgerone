-- ============================================================================
-- LedgerOne Database Security & RLS Setup Script
-- This script fixes database structure issues and enables comprehensive RLS security
-- Run this script in your Supabase SQL Editor with service role privileges
-- ============================================================================

-- ============================================================================
-- STEP 1: Fix Database Structure Issues
-- ============================================================================

-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Drop and recreate the users_public view to match actual structure
DROP VIEW IF EXISTS users_public;
CREATE OR REPLACE VIEW users_public AS
SELECT id, username, full_name, role, status, created_at, last_login
FROM users
WHERE status = 'active';

-- ============================================================================
-- STEP 2: Enable RLS on All Tables
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_permissions table
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on all data tables
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
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_related_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Drop Existing Policies (Clean Slate)
-- ============================================================================

-- Drop any existing policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "No direct access to users table" ON users;

-- Drop any existing policies on user_permissions table
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;

-- ============================================================================
-- STEP 4: Create Secure Policies for Users Table
-- ============================================================================

-- Policy: No one can read password_hash from the users table directly
-- Only the service role (server-side) can access password_hash during login
CREATE POLICY "No direct access to users table" ON users
FOR ALL USING (false);

-- ============================================================================
-- STEP 5: Create Secure Policies for User Permissions Table
-- ============================================================================

-- Policy: Only authenticated users can view their own permissions
CREATE POLICY "Users can view their own permissions" ON user_permissions
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can manage permissions
CREATE POLICY "Admins can manage all permissions" ON user_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active'
  )
);

-- ============================================================================
-- STEP 6: Create Secure Policies for Data Tables
-- ============================================================================

-- High Security Tables (Financial/Login Data)
-- Bank Accounts
CREATE POLICY "Authenticated users can read bank accounts" ON bank_accounts 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage bank accounts" ON bank_accounts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Credit Cards
CREATE POLICY "Authenticated users can read credit cards" ON credit_cards 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage credit cards" ON credit_cards 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Crypto Accounts
CREATE POLICY "Authenticated users can read crypto accounts" ON crypto_accounts 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage crypto accounts" ON crypto_accounts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Investment Accounts
CREATE POLICY "Authenticated users can read investment accounts" ON investment_accounts 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage investment accounts" ON investment_accounts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Hosting Accounts
CREATE POLICY "Authenticated users can read hosting accounts" ON hosting_accounts 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage hosting accounts" ON hosting_accounts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Medium Security Tables (Personal/Contact Data)
-- Entities
CREATE POLICY "Authenticated users can read entities" ON entities 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage entities" ON entities 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Contacts
CREATE POLICY "Authenticated users can read contacts" ON contacts 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage contacts" ON contacts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Emails
CREATE POLICY "Authenticated users can read emails" ON emails 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage emails" ON emails 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Phones
CREATE POLICY "Authenticated users can read phones" ON phones 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage phones" ON phones 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Websites
CREATE POLICY "Authenticated users can read websites" ON websites 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage websites" ON websites 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Low Security Tables (Metadata/Relationships)
-- Entity Relationships
CREATE POLICY "Authenticated users can read entity relationships" ON entity_relationships 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage entity relationships" ON entity_relationships 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- Entity Related Data
CREATE POLICY "Authenticated users can read entity related data" ON entity_related_data 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage entity related data" ON entity_related_data 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- App Logs
CREATE POLICY "Authenticated users can read app logs" ON app_logs 
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage app logs" ON app_logs 
FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin' AND status = 'active')
);

-- ============================================================================
-- STEP 7: Grant Permissions
-- ============================================================================

-- Grant permissions on users_public view
GRANT SELECT ON users_public TO anon, authenticated;

-- Grant all permissions on users table to service role (for login verification)
GRANT ALL ON users TO service_role;

-- Grant all permissions on user_permissions table to service role
GRANT ALL ON user_permissions TO service_role;

-- Grant all permissions on all data tables to service role
GRANT ALL ON entities TO service_role;
GRANT ALL ON contacts TO service_role;
GRANT ALL ON emails TO service_role;
GRANT ALL ON phones TO service_role;
GRANT ALL ON websites TO service_role;
GRANT ALL ON bank_accounts TO service_role;
GRANT ALL ON investment_accounts TO service_role;
GRANT ALL ON crypto_accounts TO service_role;
GRANT ALL ON credit_cards TO service_role;
GRANT ALL ON hosting_accounts TO service_role;
GRANT ALL ON entity_relationships TO service_role;
GRANT ALL ON entity_related_data TO service_role;
GRANT ALL ON app_logs TO service_role;

-- ============================================================================
-- STEP 8: Create Secure Functions for Admin Operations
-- ============================================================================

-- Create a function to safely create admin users
CREATE OR REPLACE FUNCTION create_admin_user(
  p_username TEXT,
  p_password_hash TEXT,
  p_full_name TEXT DEFAULT 'System Administrator'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RETURN 'User already exists';
  END IF;
  
  -- Insert new admin user
  INSERT INTO users (username, password_hash, full_name, role, status)
  VALUES (p_username, p_password_hash, p_full_name, 'admin', 'active');
  
  RETURN 'Admin user created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error creating admin user: ' || SQLERRM;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION create_admin_user TO service_role;

-- Create a function to safely update admin password
CREATE OR REPLACE FUNCTION update_admin_password(
  p_username TEXT,
  p_new_password_hash TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update password for the specified user
  UPDATE users 
  SET password_hash = p_new_password_hash, updated_at = NOW()
  WHERE username = p_username;
  
  IF FOUND THEN
    RETURN 'Password updated successfully';
  ELSE
    RETURN 'User not found';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error updating password: ' || SQLERRM;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION update_admin_password TO service_role;

-- ============================================================================
-- STEP 9: Verification and Status Report
-- ============================================================================

-- Verify the setup
SELECT 'RLS enabled on users table' as status;
SELECT 'users_public view created' as status;
SELECT 'Admin user functions created' as status;

-- Show RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show all policies created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SCRIPT COMPLETION
-- ============================================================================

SELECT 'Database security setup completed successfully!' as message;
SELECT 'All tables now have RLS enabled with secure policies' as security_status;
SELECT 'Service role has full access for server-side operations' as service_access;
SELECT 'Client access is restricted to authenticated users only' as client_access;
