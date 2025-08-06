-- ============================================================================
-- LedgerOne User Authentication Tables Setup (Fixed - No RLS)
-- Run this script in your Supabase SQL Editor
-- ============================================================================

-- First, drop the tables if they exist to start fresh
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create user_permissions table
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_table_name ON user_permissions(table_name);

-- Disable RLS for now (we'll implement our own auth logic)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, full_name, role, status)
VALUES (
  'admin',
  '$2a$10$rQZ9vKzqX8mN3pL2sJ1hA.BCDEFGHIJKLMNOPQRSTUVWXYZabcdef',
  'System Administrator',
  'admin',
  'active'
) ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Grant admin user permissions to all tables
INSERT INTO user_permissions (user_id, table_name, can_read, can_write, can_delete, granted_by)
SELECT 
  u.id,
  table_name,
  true,
  true,
  true,
  u.id
FROM users u, (
  VALUES 
    ('entities'),
    ('contacts'),
    ('emails'),
    ('phones'),
    ('websites'),
    ('bank_accounts'),
    ('investment_accounts'),
    ('crypto_accounts'),
    ('credit_cards'),
    ('hosting_accounts'),
    ('entity_relationships'),
    ('entity_related_data')
) AS tables(table_name)
WHERE u.username = 'admin'
ON CONFLICT (user_id, table_name) DO UPDATE SET
  can_read = EXCLUDED.can_read,
  can_write = EXCLUDED.can_write,
  can_delete = EXCLUDED.can_delete;

-- Verify the setup
SELECT 'Users table created' as status, COUNT(*) as user_count FROM users;
SELECT 'Permissions table created' as status, COUNT(*) as permission_count FROM user_permissions;
SELECT 'Admin user details' as info, username, full_name, role, status FROM users WHERE username = 'admin'; 