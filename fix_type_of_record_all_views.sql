-- Fix type_of_record column data type and nullability (handling ALL view dependencies)
-- Run this on Supabase SQL Editor

-- First, let's check ALL views that depend on this table
SELECT 
    viewname,
    schemaname
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%entity%' OR viewname LIKE '%migration%';

-- Check the current structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'id' AND data_type = 'uuid' THEN '✅ Primary key'
        WHEN column_name = 'entity_id' AND data_type = 'uuid' THEN '✅ Entity FK'
        WHEN column_name = 'related_data_id' AND data_type = 'uuid' THEN '✅ Related data FK'
        WHEN column_name = 'type_of_record' AND data_type = 'text' THEN '✅ Type field'
        WHEN column_name = 'type_of_record' AND data_type = 'character varying' THEN '⚠️ Type field (wrong type)'
        WHEN column_name = 'relationship_description' AND data_type = 'text' THEN '✅ Description field'
        WHEN column_name = 'created_at' AND data_type = 'timestamp with time zone' THEN '✅ Timestamp'
        WHEN column_name = 'updated_at' AND data_type = 'timestamp with time zone' THEN '✅ Timestamp'
        ELSE '❌ Unexpected column'
    END as status
FROM information_schema.columns 
WHERE table_name = 'entity_related_data' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop ALL views that depend on this table
DROP VIEW IF EXISTS entity_relationships_view;
DROP VIEW IF EXISTS migration_summary;

-- Now we can safely alter the column type
ALTER TABLE entity_related_data 
ALTER COLUMN type_of_record TYPE TEXT;

-- Make type_of_record nullable if it's not already
ALTER TABLE entity_related_data 
ALTER COLUMN type_of_record DROP NOT NULL;

-- Make relationship_description nullable if it's not already
ALTER TABLE entity_related_data 
ALTER COLUMN relationship_description DROP NOT NULL;

-- Recreate the entity_relationships_view with the correct column types
CREATE OR REPLACE VIEW entity_relationships_view AS
SELECT 
    erd.id,
    erd.entity_id,
    erd.related_data_id,
    erd.type_of_record,
    erd.relationship_description,
    erd.created_at,
    erd.updated_at,
    -- Add display names based on type
    CASE 
        WHEN erd.type_of_record = 'contacts' THEN c.name
        WHEN erd.type_of_record = 'emails' THEN e.email
        WHEN erd.type_of_record = 'phones' THEN p.phone
        WHEN erd.type_of_record = 'bank_accounts' THEN ba.bank_name
        WHEN erd.type_of_record = 'investment_accounts' THEN ia.provider
        WHEN erd.type_of_record = 'crypto_accounts' THEN ca.platform
        WHEN erd.type_of_record = 'credit_cards' THEN cc.cardholder_name
        WHEN erd.type_of_record = 'websites' THEN w.url
        WHEN erd.type_of_record = 'hosting_accounts' THEN ha.provider
        ELSE 'Unknown'
    END as related_data_display_name
FROM entity_related_data erd
LEFT JOIN contacts c ON erd.type_of_record = 'contacts' AND erd.related_data_id = c.id
LEFT JOIN emails e ON erd.type_of_record = 'emails' AND erd.related_data_id = e.id
LEFT JOIN phones p ON erd.type_of_record = 'phones' AND erd.related_data_id = p.id
LEFT JOIN bank_accounts ba ON erd.type_of_record = 'bank_accounts' AND erd.related_data_id = ba.id
LEFT JOIN investment_accounts ia ON erd.type_of_record = 'investment_accounts' AND erd.related_data_id = ia.id
LEFT JOIN crypto_accounts ca ON erd.type_of_record = 'crypto_accounts' AND erd.related_data_id = ca.id
LEFT JOIN credit_cards cc ON erd.type_of_record = 'credit_cards' AND erd.related_data_id = cc.id
LEFT JOIN websites w ON erd.type_of_record = 'websites' AND erd.related_data_id = w.id
LEFT JOIN hosting_accounts ha ON erd.type_of_record = 'hosting_accounts' AND erd.related_data_id = ha.id;

-- Recreate the migration_summary view (if it existed)
-- Note: This is a generic recreation - you may need to adjust based on your actual migration_summary view
CREATE OR REPLACE VIEW migration_summary AS
SELECT 
    'entity_related_data' as table_name,
    COUNT(*) as record_count,
    'Many-to-many relationships' as description
FROM entity_related_data;

-- Verify the final structure
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

-- Test the views
SELECT 'entity_relationships_view' as view_name, COUNT(*) as record_count FROM entity_relationships_view
UNION ALL
SELECT 'migration_summary' as view_name, COUNT(*) as record_count FROM migration_summary; 