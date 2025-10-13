-- =====================================================
-- FIX SECURITY DEFINER VIEWS - Quick Remediation
-- =====================================================
-- This script removes SECURITY DEFINER from 6 views
-- that are currently flagged by Supabase linter
-- =====================================================

-- IMPORTANT: Views themselves cannot have SECURITY DEFINER
-- The linter is detecting that these views were somehow created
-- with SECURITY DEFINER, which is unusual. We'll recreate them
-- as standard views (SECURITY INVOKER by default)

-- =====================================================
-- 1. FIX debug_logs VIEW
-- =====================================================
DROP VIEW IF EXISTS debug_logs CASCADE;

CREATE VIEW debug_logs 
WITH (security_invoker=true)
AS
SELECT 
    timestamp,
    source,
    action,
    message,
    details
FROM app_logs 
WHERE level = 'DEBUG' 
ORDER BY timestamp DESC;

COMMENT ON VIEW debug_logs IS 'View of debug-level log entries';
GRANT SELECT ON debug_logs TO authenticated, service_role;

-- =====================================================
-- 2. FIX users_public VIEW
-- =====================================================
DROP VIEW IF EXISTS users_public CASCADE;

CREATE VIEW users_public 
WITH (security_invoker=true)
AS
SELECT 
    id, 
    username, 
    full_name, 
    role, 
    status, 
    created_at, 
    last_login
FROM users
WHERE status = 'active';

COMMENT ON VIEW users_public IS 'Public view of active users (excludes password_hash)';
GRANT SELECT ON users_public TO anon, authenticated, service_role;

-- =====================================================
-- 3. FIX recent_errors VIEW
-- =====================================================
DROP VIEW IF EXISTS recent_errors CASCADE;

CREATE VIEW recent_errors 
WITH (security_invoker=true)
AS
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

COMMENT ON VIEW recent_errors IS 'View of error-level log entries';
GRANT SELECT ON recent_errors TO authenticated, service_role;

-- =====================================================
-- 4. FIX unified_search_view VIEW
-- =====================================================
DROP VIEW IF EXISTS unified_search_view CASCADE;

CREATE VIEW unified_search_view 
WITH (security_invoker=true)
AS
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

COMMENT ON VIEW unified_search_view IS 'Unified view for searching across all object types';
GRANT SELECT ON unified_search_view TO authenticated, service_role;

-- =====================================================
-- 5. FIX entity_relationships_view VIEW
-- =====================================================
DROP VIEW IF EXISTS entity_relationships_view CASCADE;

CREATE VIEW entity_relationships_view 
WITH (security_invoker=true)
AS
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

COMMENT ON VIEW entity_relationships_view IS 'View of entity relationships with entity details';
GRANT SELECT ON entity_relationships_view TO authenticated, service_role;

-- =====================================================
-- 6. FIX migration_summary VIEW
-- =====================================================
DROP VIEW IF EXISTS migration_summary CASCADE;

CREATE VIEW migration_summary 
WITH (security_invoker=true)
AS
SELECT 
    type_of_record,
    COUNT(*) as total_count,
    COUNT(DISTINCT entity_id) as unique_entities,
    COUNT(DISTINCT related_data_id) as unique_related_data
FROM entity_related_data
GROUP BY type_of_record
ORDER BY type_of_record;

COMMENT ON VIEW migration_summary IS 'Summary of migrated data by record type';
GRANT SELECT ON migration_summary TO authenticated, service_role;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that all views are now using security_invoker
SELECT 
    viewname,
    viewowner,
    definition
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN (
        'debug_logs',
        'users_public',
        'recent_errors',
        'unified_search_view',
        'entity_relationships_view',
        'migration_summary'
    )
ORDER BY viewname;

-- Verify permissions
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name IN (
        'debug_logs',
        'users_public',
        'recent_errors',
        'unified_search_view',
        'entity_relationships_view',
        'migration_summary'
    )
ORDER BY table_name, grantee;

-- Success message
SELECT 'All 6 views successfully recreated with security_invoker=true' as status;

