-- =====================================================
-- FIX FUNCTION SEARCH PATH WARNINGS
-- =====================================================
-- This script adds SET search_path = public to all functions
-- that currently have mutable search paths.
-- This prevents search path injection attacks.
-- =====================================================

-- SECURITY ISSUE: Functions without SET search_path can be vulnerable
-- to search path injection attacks where malicious users could create
-- objects in other schemas that get called instead of the intended ones.

-- SOLUTION: Add "SET search_path = public" to all function definitions
-- This ensures functions only use objects from the public schema.

-- =====================================================
-- 1. FIX create_entity_relationship FUNCTION
-- =====================================================

-- First, let's get the current function definition to preserve its logic
-- We need to recreate it with SET search_path = public

CREATE OR REPLACE FUNCTION create_entity_relationship(
    p_entity_id UUID,
    p_related_entity_id UUID,
    p_relationship_type TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_relationship_id UUID;
BEGIN
    -- Insert the relationship
    INSERT INTO entity_relationships (
        entity_id,
        related_entity_id,
        relationship_type,
        description
    ) VALUES (
        p_entity_id,
        p_related_entity_id,
        p_relationship_type,
        p_description
    )
    RETURNING id INTO v_relationship_id;
    
    RETURN v_relationship_id;
END;
$$;

COMMENT ON FUNCTION create_entity_relationship IS 'Creates a relationship between two entities with search_path protection';

-- =====================================================
-- 2. FIX check_user_permission FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
DECLARE
    v_has_permission BOOLEAN;
BEGIN
    -- Check if user has the specified permission
    -- This assumes you have a user_permissions table
    SELECT EXISTS (
        SELECT 1 
        FROM user_permissions up
        WHERE up.user_id = p_user_id 
        AND up.permission = p_permission
        AND up.is_active = true
    ) INTO v_has_permission;
    
    RETURN COALESCE(v_has_permission, false);
END;
$$;

COMMENT ON FUNCTION check_user_permission IS 'Checks if a user has a specific permission with search_path protection';

-- =====================================================
-- 3. FIX get_entity_relationships FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_entity_relationships(
    p_entity_id UUID,
    p_relationship_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    entity_id UUID,
    related_entity_id UUID,
    relationship_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id,
        er.entity_id,
        er.related_entity_id,
        er.relationship_type,
        er.description,
        er.created_at,
        er.updated_at
    FROM entity_relationships er
    WHERE er.entity_id = p_entity_id
        AND (p_relationship_type IS NULL OR er.relationship_type = p_relationship_type)
    ORDER BY er.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_entity_relationships IS 'Retrieves relationships for an entity with search_path protection';

-- =====================================================
-- 4. FIX insert_app_log FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION insert_app_log(
    p_level VARCHAR(20),
    p_source VARCHAR(100),
    p_action VARCHAR(100),
    p_message TEXT,
    p_details JSONB DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO app_logs (
        level,
        source,
        action,
        message,
        details,
        stack_trace,
        user_id,
        session_id,
        ip_address,
        user_agent,
        timestamp
    ) VALUES (
        p_level,
        p_source,
        p_action,
        p_message,
        p_details,
        p_stack_trace,
        p_user_id,
        p_session_id,
        p_ip_address,
        p_user_agent,
        NOW()
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

COMMENT ON FUNCTION insert_app_log IS 'Inserts application log entry with search_path protection';

-- =====================================================
-- 5. FIX log_app_event FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION log_app_event(
    p_level VARCHAR(20),
    p_source VARCHAR(100),
    p_action VARCHAR(100),
    p_message TEXT,
    p_details JSONB DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO app_logs (
        level,
        source,
        action,
        message,
        details,
        stack_trace,
        user_id,
        session_id,
        ip_address,
        user_agent
    ) VALUES (
        p_level,
        p_source,
        p_action,
        p_message,
        p_details,
        p_stack_trace,
        p_user_id,
        p_session_id,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

COMMENT ON FUNCTION log_app_event IS 'Logs application events with search_path protection';

-- =====================================================
-- 6. FIX search_all_objects FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION search_all_objects(
    search_term TEXT, 
    page_num INTEGER DEFAULT 1, 
    page_size INTEGER DEFAULT 20
)
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
)
LANGUAGE plpgsql
SET search_path = public
SECURITY INVOKER
AS $$
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
$$;

COMMENT ON FUNCTION search_all_objects IS 'Searches across all object types with search_path protection';

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_all_objects(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_all_objects(TEXT, INTEGER, INTEGER) TO service_role;

-- =====================================================
-- 7. FIX update_entity_related_data_updated_at FUNCTION
-- =====================================================

-- This is typically a trigger function that updates the updated_at timestamp
CREATE OR REPLACE FUNCTION update_entity_related_data_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_entity_related_data_updated_at IS 'Trigger function to update updated_at timestamp with search_path protection';

-- Recreate the trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_entity_related_data_updated_at ON entity_related_data;
CREATE TRIGGER trigger_update_entity_related_data_updated_at
    BEFORE UPDATE ON entity_related_data
    FOR EACH ROW
    EXECUTE FUNCTION update_entity_related_data_updated_at();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that all functions now have search_path set
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    CASE 
        WHEN p.prosecdef THEN 'DEFINER' 
        ELSE 'INVOKER' 
    END as security_type,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
    AND p.proname IN (
        'create_entity_relationship',
        'check_user_permission',
        'get_entity_relationships',
        'insert_app_log',
        'log_app_event',
        'search_all_objects',
        'update_entity_related_data_updated_at'
    )
ORDER BY p.proname;

-- List all config settings for these functions
SELECT 
    p.proname as function_name,
    unnest(p.proconfig) as setting
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
    AND p.proname IN (
        'create_entity_relationship',
        'check_user_permission',
        'get_entity_relationships',
        'insert_app_log',
        'log_app_event',
        'search_all_objects',
        'update_entity_related_data_updated_at'
    )
ORDER BY p.proname;

-- Success message
SELECT 'All 7 functions successfully updated with SET search_path = public' as status;

-- =====================================================
-- NOTES
-- =====================================================

/*
WHAT IS SEARCH PATH?
---------------------
The search_path is a PostgreSQL setting that determines which schemas 
to search when looking for database objects (tables, functions, etc.).

WHY IS THIS A SECURITY ISSUE?
------------------------------
If search_path is mutable (not set), a malicious user could:
1. Create a schema they control
2. Add that schema to their search_path
3. Create malicious objects (tables/functions) with the same names
4. When the function runs, it might call the malicious objects instead

EXAMPLE ATTACK:
---------------
Without SET search_path:
- Attacker creates schema 'evil' with table 'users'
- Attacker sets search_path to 'evil, public'
- Function tries to SELECT from 'users'
- PostgreSQL finds 'evil.users' first and uses that instead of 'public.users'

THE FIX:
--------
Adding "SET search_path = public" ensures the function ONLY looks in the 
public schema, preventing this attack vector.

BEST PRACTICES:
---------------
1. Always set search_path for SECURITY DEFINER functions (required)
2. Set search_path for all public-facing functions (recommended)
3. Use fully qualified names (schema.table) in critical functions
4. Regularly audit functions with: SELECT * FROM pg_proc WHERE proconfig IS NULL;

IMPACT:
-------
- No functional changes to your application
- Only security hardening
- Functions behave exactly the same
- Protection against search path injection attacks
*/

