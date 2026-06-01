-- =====================================================
-- FIX entity_relationships TABLE RLS POLICY
-- =====================================================
-- This script fixes the RLS warning for entity_relationships table
-- by adding user_id column and creating proper RLS policies
-- =====================================================

-- Step 1: Add user_id column to entity_relationships
ALTER TABLE entity_relationships 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_entity_relationships_user_id ON entity_relationships(user_id);

-- Step 3: Ensure RLS is enabled
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;

-- Step 4: SECURITY HARDENING - Explicitly REVOKE all permissions from anon and authenticated
REVOKE ALL ON TABLE entity_relationships FROM anon;
REVOKE ALL ON TABLE entity_relationships FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE entity_relationships TO authenticated;

-- Step 5: Drop existing overly permissive policies
DO $$
DECLARE
  policy_name TEXT;
BEGIN
  FOR policy_name IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'entity_relationships'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON entity_relationships', policy_name);
  END LOOP;
END $$;

-- Step 6: Create new secure RLS policies
-- Service role: Full access (bypasses RLS - acceptable for service_role only)
CREATE POLICY "Service role has full access to entity_relationships" ON entity_relationships
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated users: Restrictive policies (NOT using true)
-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can view entity_relationships with user_id" ON entity_relationships
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can insert entity_relationships with user_id" ON entity_relationships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can update entity_relationships with user_id" ON entity_relationships
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SECURITY FIX: Restrict access to authenticated owners using auth.uid() instead of existence check
CREATE POLICY "Authenticated users can delete entity_relationships with user_id" ON entity_relationships
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- SECURITY: No policies for anon role = denied by default (secure)

-- Step 7: Backfill existing records with a default user_id
DO $$
DECLARE
  default_user_id UUID;
BEGIN
  -- Get the first admin user
  SELECT id INTO default_user_id 
  FROM users 
  WHERE role = 'admin' 
  AND status = 'active'
  ORDER BY created_at ASC
  LIMIT 1;

  -- If no admin exists, get the first user
  IF default_user_id IS NULL THEN
    SELECT id INTO default_user_id 
    FROM users 
    WHERE status = 'active'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Backfill user_id for entity_relationships
  IF default_user_id IS NOT NULL THEN
    UPDATE entity_relationships SET user_id = default_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Step 8: Add comment
COMMENT ON COLUMN entity_relationships.user_id IS 'User who owns this entity relationship record';

-- Success message
SELECT 'entity_relationships RLS policy fixed successfully!' as status;
