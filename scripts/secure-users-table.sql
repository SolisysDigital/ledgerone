-- Secure the users table with RLS policies
-- This script should be run with the service role key

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Create a secure view that excludes password_hash but includes all other columns
CREATE OR REPLACE VIEW users_public AS
SELECT id, username, full_name, role, status, created_at, last_login
FROM users
WHERE status = 'active';

-- Policy: No one can read password_hash from the users table directly
-- Only the service role (server-side) can access password_hash during login
CREATE POLICY "No direct access to users table" ON users
FOR ALL USING (false);

-- Policy: Service role can access all data (for login verification)
-- This is handled by the service role key, not RLS policies

-- Grant permissions
GRANT SELECT ON users_public TO anon, authenticated;
GRANT ALL ON users TO service_role;

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

-- Verify the setup
SELECT 'RLS enabled on users table' as status;
SELECT 'users_public view created' as status;
SELECT 'Admin user functions created' as status;
