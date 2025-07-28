-- Fix type_of_record column data type and nullability
-- Run this on Supabase SQL Editor

-- First, let's check the current structure
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

-- Fix the type_of_record column data type from character varying to text
ALTER TABLE entity_related_data 
ALTER COLUMN type_of_record TYPE TEXT;

-- Make type_of_record nullable if it's not already
ALTER TABLE entity_related_data 
ALTER COLUMN type_of_record DROP NOT NULL;

-- Make relationship_description nullable if it's not already
ALTER TABLE entity_related_data 
ALTER COLUMN relationship_description DROP NOT NULL;

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