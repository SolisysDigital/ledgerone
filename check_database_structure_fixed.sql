-- Check Database Structure (Fixed Version)
-- This script verifies the database structure for the many-to-many relationship system

-- 1. Check if entity_related_data table exists
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'entity_related_data' THEN '✅ Junction table exists'
        ELSE '❌ Junction table missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'entity_related_data';

-- 2. Check entity_related_data table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'id' AND data_type = 'uuid' THEN '✅ Primary key'
        WHEN column_name = 'entity_id' AND data_type = 'uuid' THEN '✅ Entity FK'
        WHEN column_name = 'related_data_id' AND data_type = 'uuid' THEN '✅ Related data FK'
        WHEN column_name = 'type_of_record' AND data_type = 'text' THEN '✅ Type field'
        WHEN column_name = 'relationship_description' AND data_type = 'text' THEN '✅ Description field'
        WHEN column_name = 'created_at' AND data_type = 'timestamp with time zone' THEN '✅ Timestamp'
        WHEN column_name = 'updated_at' AND data_type = 'timestamp with time zone' THEN '✅ Timestamp'
        ELSE '❌ Unexpected column'
    END as status
FROM information_schema.columns 
WHERE table_name = 'entity_related_data' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if old entity_id columns have been removed from related tables
SELECT 
    table_name,
    column_name,
    CASE 
        WHEN column_name IS NULL THEN '✅ entity_id column removed'
        ELSE '❌ entity_id column still exists'
    END as status
FROM (
    SELECT 'contacts' as table_name
    UNION ALL SELECT 'emails'
    UNION ALL SELECT 'phones'
    UNION ALL SELECT 'bank_accounts'
    UNION ALL SELECT 'investment_accounts'
    UNION ALL SELECT 'crypto_accounts'
    UNION ALL SELECT 'credit_cards'
    UNION ALL SELECT 'websites'
    UNION ALL SELECT 'hosting_accounts'
) t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.column_name = 'entity_id'
WHERE c.table_schema = 'public'
ORDER BY t.table_name;

-- 4. Check entities table structure (should have all legal info fields)
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('id', 'name', 'type', 'description', 'short_description') THEN '✅ Core fields'
        WHEN column_name IN ('legal_business_name', 'employer_identification_number', 'incorporation_date',
                           'country_of_formation', 'state_of_formation', 'business_type', 'industry',
                           'naics_code', 'legal_address', 'mailing_address', 'registered_agent_name',
                           'registered_agent_address') THEN '✅ Legal info fields'
        WHEN column_name LIKE 'officer%' THEN '✅ Officer fields'
        WHEN column_name LIKE 'texas_%' THEN '✅ Texas-specific fields'
        WHEN column_name IN ('created_at', 'updated_at') THEN '✅ Timestamp fields'
        WHEN column_name = 'ein' THEN '✅ EIN field (alternative name)'
        WHEN column_name = 'type_of_record' THEN '✅ Type of record field'
        WHEN column_name = 'taxpayer_number' THEN '✅ Taxpayer number field'
        WHEN column_name = 'file_number' THEN '✅ File number field'
        WHEN column_name = 'webfile_number' THEN '✅ Webfile number field'
        WHEN column_name = 'webfile_login' THEN '✅ Webfile login field'
        WHEN column_name = 'webfile_password' THEN '✅ Webfile password field'
        ELSE '❌ Unexpected field'
    END as status
FROM information_schema.columns 
WHERE table_name = 'entities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check for indexes on entity_related_data
SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexname LIKE '%entity_related_data%' THEN '✅ Index exists'
        ELSE '❌ Missing index'
    END as status
FROM pg_indexes 
WHERE tablename = 'entity_related_data';

-- 6. Check if the entity_relationships_view exists
SELECT 
    viewname,
    CASE 
        WHEN viewname = 'entity_relationships_view' THEN '✅ View exists'
        ELSE '❌ View missing'
    END as status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'entity_relationships_view';

-- 7. Test the view if it exists
SELECT 
    'Testing entity_relationships_view' as test,
    COUNT(*) as record_count
FROM entity_relationships_view;

-- 8. Check for any foreign key constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN tc.table_name = 'entity_related_data' AND kcu.column_name = 'entity_id' THEN '✅ Entity FK'
        WHEN tc.table_name = 'entity_related_data' AND kcu.column_name = 'related_data_id' THEN '✅ Related data FK'
        ELSE '❌ Unexpected FK'
    END as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'entity_related_data';

-- 9. Check if updated_at trigger exists on entity_related_data
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN '✅ Updated_at trigger exists'
        ELSE '❌ Updated_at trigger missing'
    END as status
FROM information_schema.triggers 
WHERE event_object_table = 'entity_related_data' 
AND trigger_schema = 'public';

-- 10. Sample data check - count records in each table
SELECT 
    'entities' as table_name,
    COUNT(*) as record_count
FROM entities
UNION ALL
SELECT 
    'contacts' as table_name,
    COUNT(*) as record_count
FROM contacts
UNION ALL
SELECT 
    'emails' as table_name,
    COUNT(*) as record_count
FROM emails
UNION ALL
SELECT 
    'entity_related_data' as table_name,
    COUNT(*) as record_count
FROM entity_related_data;

-- 11. Check for any orphaned relationships (relationships without valid entities)
SELECT 
    'Orphaned relationships check' as test,
    COUNT(*) as orphaned_count
FROM entity_related_data erd
LEFT JOIN entities e ON erd.entity_id = e.id
WHERE e.id IS NULL;

-- 12. Check for any orphaned related data (relationships pointing to non-existent records)
SELECT 
    'Orphaned related data check' as test,
    erd.type_of_record,
    COUNT(*) as orphaned_count
FROM entity_related_data erd
LEFT JOIN (
    SELECT 'contacts' as type, id FROM contacts
    UNION ALL SELECT 'emails' as type, id FROM emails
    UNION ALL SELECT 'phones' as type, id FROM phones
    UNION ALL SELECT 'bank_accounts' as type, id FROM bank_accounts
    UNION ALL SELECT 'investment_accounts' as type, id FROM investment_accounts
    UNION ALL SELECT 'crypto_accounts' as type, id FROM crypto_accounts
    UNION ALL SELECT 'credit_cards' as type, id FROM credit_cards
    UNION ALL SELECT 'websites' as type, id FROM websites
    UNION ALL SELECT 'hosting_accounts' as type, id FROM hosting_accounts
) related_data ON erd.type_of_record = related_data.type AND erd.related_data_id = related_data.id
WHERE related_data.id IS NULL
GROUP BY erd.type_of_record;

-- 13. Show all columns in entities table for reference
SELECT 
    'All entities columns' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'entities' 
AND table_schema = 'public'
ORDER BY ordinal_position; 