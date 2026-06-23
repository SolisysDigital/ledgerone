-- =====================================================
-- FIX ALL SECURITY ADVISOR WARNINGS
-- =====================================================
-- Resolves all 40 Supabase Security Advisor warnings:
--
-- Category 1: "Public Can See Object in GraphQL Schema"
--   Affects: debug_logs, entity_relationships_view, migration_summary,
--            recent_errors, unified_search_view, users_public
--   Fix: Revoke graphql schema USAGE + anon/authenticated table/view grants
--
-- Category 2: "Signed-In Users Can See Object in GraphQL Schema"
--   Affects: app_logs, bank_accounts, contacts, credit_cards,
--            crypto_accounts, debug_logs, emails, entities,
--            entity_related_data, entity_relationships_view,
--            hosting_accounts, investment_accounts, migration_summary,
--            phones, recent_errors, securities_held, unified_search_view,
--            users, users_public, websites
--   Fix: Revoke authenticated role table grants; pg_graphql exposes
--        anything anon/authenticated can SELECT from
--
-- Category 3: "Security Definer Function Exposed to anon/authenticated"
--   Affects: anon_security_definer / authenticated_security_definer
--            function families (check_user_permission, create_admin_user,
--            insert_app_log, is_admin_user, update_admin_password, etc.)
--   Fix: REVOKE EXECUTE from anon, authenticated, PUBLIC
--
-- =====================================================
-- RUN THIS ENTIRE SCRIPT IN ONE TRANSACTION
-- =====================================================

BEGIN;

-- -------------------------------------------------------
-- PART 1: LOCK DOWN pg_graphql / graphql SCHEMA
-- -------------------------------------------------------
-- pg_graphql exposes every table/view/function that the
-- 'anon' or 'authenticated' role can SELECT / EXECUTE.
-- The safest fix (we don't use GraphQL) is to revoke the
-- graphql schema from those roles entirely.

-- Revoke graphql schema usage (silences ALL graphql warnings)
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL PRIVILEGES ON ALL TABLES    IN SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA graphql FROM anon, authenticated, PUBLIC;

-- Also revoke the graphql_public role usage if it was granted to anon/authenticated
DO $$
BEGIN
  -- graphql_public is the role pg_graphql creates; revoke it from anon/authenticated
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'graphql_public') THEN
    REVOKE graphql_public FROM anon;
    REVOKE graphql_public FROM authenticated;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if graphql_public role doesn't exist or grant doesn't exist
  NULL;
END $$;

-- -------------------------------------------------------
-- PART 2: LOCK DOWN public SCHEMA TABLE / VIEW GRANTS
-- -------------------------------------------------------
-- Revoke SELECT from anon/authenticated on ALL tables and views
-- (service_role bypasses RLS so doesn't need explicit grants here)

REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, PUBLIC;

-- Re-grant service_role full access (it bypasses RLS but explicit grant avoids issues)
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres;

-- Make sure future tables/views/sequences are also locked down
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES    FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES    TO service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role, postgres;

-- -------------------------------------------------------
-- PART 3: LOCK DOWN ALL FUNCTIONS / ROUTINES
-- -------------------------------------------------------
-- Revoke execute from anon/authenticated/PUBLIC on every function,
-- then grant selectively only what the app genuinely needs.

REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated, PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON ROUTINES FROM anon, authenticated, PUBLIC;

-- Re-grant service_role execute on all functions
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO service_role, postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON ROUTINES TO service_role, postgres;

-- -------------------------------------------------------
-- PART 4: EXPLICIT REVOKE ON SECURITY DEFINER FUNCTIONS
-- -------------------------------------------------------
-- Belt-and-suspenders: explicitly revoke execute on every
-- SECURITY DEFINER function by name to guarantee no leakage.

-- check_user_permission
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='check_user_permission') THEN
    REVOKE EXECUTE ON FUNCTION public.check_user_permission(UUID, TEXT, TEXT)
      FROM anon, authenticated, PUBLIC;
  END IF;
END $$;

-- insert_app_log
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='insert_app_log') THEN
    REVOKE EXECUTE ON FUNCTION public.insert_app_log(
      text, text, text, text, jsonb, text, uuid, text, text, text)
      FROM anon, authenticated, PUBLIC;
    GRANT  EXECUTE ON FUNCTION public.insert_app_log(
      text, text, text, text, jsonb, text, uuid, text, text, text)
      TO service_role;
  END IF;
END $$;

-- log_app_event
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='log_app_event') THEN
    REVOKE EXECUTE ON FUNCTION public.log_app_event(
      varchar, varchar, varchar, text, jsonb, text, uuid, varchar, inet, text)
      FROM anon, authenticated, PUBLIC;
  END IF;
END $$;

-- create_admin_user
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='create_admin_user') THEN
    REVOKE EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, TEXT)
      FROM anon, authenticated, PUBLIC;
    GRANT  EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, TEXT)
      TO service_role;
  END IF;
END $$;

-- update_admin_password
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='update_admin_password') THEN
    REVOKE EXECUTE ON FUNCTION public.update_admin_password(TEXT, TEXT)
      FROM anon, authenticated, PUBLIC;
    GRANT  EXECUTE ON FUNCTION public.update_admin_password(TEXT, TEXT)
      TO service_role;
  END IF;
END $$;

-- is_admin_user
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='is_admin_user') THEN
    REVOKE EXECUTE ON FUNCTION public.is_admin_user(UUID)
      FROM anon, authenticated, PUBLIC;
    GRANT  EXECUTE ON FUNCTION public.is_admin_user(UUID)
      TO service_role;
  END IF;
END $$;

-- search_all_objects
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='search_all_objects') THEN
    REVOKE EXECUTE ON FUNCTION public.search_all_objects(TEXT, INTEGER, INTEGER)
      FROM anon, authenticated, PUBLIC;
    GRANT  EXECUTE ON FUNCTION public.search_all_objects(TEXT, INTEGER, INTEGER)
      TO service_role;
  END IF;
END $$;

-- get_entity_relationships
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='get_entity_relationships') THEN
    REVOKE EXECUTE ON FUNCTION public.get_entity_relationships(UUID)
      FROM anon, authenticated, PUBLIC;
    GRANT  EXECUTE ON FUNCTION public.get_entity_relationships(UUID)
      TO service_role;
  END IF;
END $$;

-- create_entity_relationship
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='create_entity_relationship') THEN
    REVOKE EXECUTE ON FUNCTION public.create_entity_relationship(UUID, UUID, VARCHAR, TEXT)
      FROM anon, authenticated, PUBLIC;
    GRANT  EXECUTE ON FUNCTION public.create_entity_relationship(UUID, UUID, VARCHAR, TEXT)
      TO service_role;
  END IF;
END $$;

-- update_entity_related_data_updated_at (trigger function)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='update_entity_related_data_updated_at') THEN
    REVOKE EXECUTE ON FUNCTION public.update_entity_related_data_updated_at()
      FROM anon, authenticated, PUBLIC;
  END IF;
END $$;

-- -------------------------------------------------------
-- PART 5: EXPLICIT REVOKE ON VIEWS
-- -------------------------------------------------------
-- Belt-and-suspenders: explicitly revoke SELECT on each view by name.
-- (Already covered by Part 2, but explicit is safer.)

DO $$
DECLARE
  v TEXT;
  views TEXT[] := ARRAY[
    'debug_logs',
    'entity_relationships_view',
    'migration_summary',
    'recent_errors',
    'unified_search_view',
    'users_public'
  ];
BEGIN
  FOREACH v IN ARRAY views LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = v
    ) THEN
      EXECUTE format('REVOKE ALL ON %I FROM anon, authenticated, PUBLIC', v);
      EXECUTE format('GRANT  SELECT ON %I TO service_role', v);
    END IF;
  END LOOP;
END $$;

-- -------------------------------------------------------
-- PART 6: ENSURE RLS IS ENABLED ON ALL SENSITIVE TABLES
-- -------------------------------------------------------
-- If any table somehow has RLS disabled, enable it now.

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'users', 'user_permissions', 'entities', 'contacts', 'emails',
    'phones', 'websites', 'bank_accounts', 'investment_accounts',
    'crypto_accounts', 'credit_cards', 'hosting_accounts',
    'securities_held', 'entity_related_data', 'app_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- -------------------------------------------------------
-- PART 7: ALSO LOCK DOWN entity_relationships TABLE
--         (it exists per the hardened script)
-- -------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'entity_relationships'
  ) THEN
    ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON entity_relationships FROM anon, authenticated, PUBLIC;
    GRANT SELECT, INSERT, UPDATE, DELETE ON entity_relationships TO service_role;
  END IF;
END $$;

COMMIT;

-- -------------------------------------------------------
-- VERIFICATION QUERIES
-- -------------------------------------------------------
-- Run these to confirm zero exposure:

-- Check: no anon/authenticated grants on public tables
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC', 'public')
ORDER BY grantee, table_name;

-- Check: no anon/authenticated execute grants on public functions
SELECT grantee, routine_name, privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC', 'public')
ORDER BY grantee, routine_name;

-- Check: RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT 'All security warnings resolved. Re-run Security Advisor to confirm 0 warnings.' AS status;
