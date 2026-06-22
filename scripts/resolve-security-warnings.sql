-- =====================================================
-- DATABASE SECURITY HARDENING & WARNINGS RESOLUTION
-- =====================================================
-- This script completely resolves Supabase Security Advisor lints:
-- 1. pg_graphql warnings (exposing tables/views to public/anon/authenticated)
-- 2. anon_security_definer and authenticated_security_definer warnings (exposing security definer functions)
-- =====================================================

-- Step 1: Revoke all existing default and public privileges on the public schema
REVOKE ALL ON SCHEMA public FROM anon, authenticated, PUBLIC;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, postgres;

-- Step 2: Revoke all privileges on all tables and views in public schema from public roles
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, PUBLIC;

-- Step 3: Revoke all privileges on all sequences in public schema from public roles
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, PUBLIC;

-- Step 4: Revoke all privileges on all routines (functions) in public schema from public roles
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated, PUBLIC;

-- Step 5: Explicitly grant full control to postgres and service_role administrative roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- Step 6: Alter default privileges to secure all future objects automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated, PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, service_role;

-- Step 7: Revoke access to pg_graphql completely for anon and authenticated roles
-- Since the application uses service_role client server-side and does not use GraphQL,
-- revoking usage on pg_graphql schema completely silences all pg_graphql linter warnings.
REVOKE ALL ON SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL ROUTINES IN SCHEMA graphql FROM anon, authenticated, PUBLIC;

-- Optional: Drop pg_graphql extension if you don't plan to use it at all
-- DROP EXTENSION IF EXISTS pg_graphql CASCADE;

SELECT 'Security linter warnings resolved successfully! Database access hardened.' as status;
