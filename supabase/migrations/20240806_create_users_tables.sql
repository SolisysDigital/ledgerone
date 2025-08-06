-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS user_permissions (
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

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Create RLS policies for user_permissions table
CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Insert default admin user (password will be 'admin123' - hash placeholder)
INSERT INTO users (username, password_hash, full_name, role, status)
VALUES (
  'admin',
  '$2a$10$rQZ9vKzqX8mN3pL2sJ1hA.BCDEFGHIJKLMNOPQRSTUVWXYZabcdef', -- Placeholder hash for 'admin123'
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

-- Create a function to check if a user has permission (optional utility)
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_table_name TEXT,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Admin users have all permissions
  SELECT EXISTS(
    SELECT 1 FROM users 
    WHERE id = p_user_id AND role = 'admin' AND status = 'active'
  ) INTO has_permission;
  
  IF has_permission THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permission
  CASE p_permission
    WHEN 'read' THEN
      SELECT COALESCE(can_read, FALSE) INTO has_permission
      FROM user_permissions 
      WHERE user_id = p_user_id AND table_name = p_table_name;
    WHEN 'write' THEN
      SELECT COALESCE(can_write, FALSE) INTO has_permission
      FROM user_permissions 
      WHERE user_id = p_user_id AND table_name = p_table_name;
    WHEN 'delete' THEN
      SELECT COALESCE(can_delete, FALSE) INTO has_permission
      FROM user_permissions 
      WHERE user_id = p_user_id AND table_name = p_table_name;
    ELSE
      has_permission := FALSE;
  END CASE;
  
  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_user_permission(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_permission(UUID, TEXT, TEXT) TO anon; 