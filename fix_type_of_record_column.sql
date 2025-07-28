-- Fix type_of_record column in entity_related_data table
-- Run this on Supabase SQL Editor

-- First, let's check the current structure of entity_related_data table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
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

-- Check if type_of_record column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'entity_related_data' 
AND table_schema = 'public'
AND column_name = 'type_of_record';

-- If type_of_record doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entity_related_data' 
        AND table_schema = 'public' 
        AND column_name = 'type_of_record'
    ) THEN
        ALTER TABLE entity_related_data ADD COLUMN type_of_record TEXT;
        RAISE NOTICE 'Added type_of_record column to entity_related_data table';
    ELSE
        RAISE NOTICE 'type_of_record column already exists';
    END IF;
END $$;

-- Check if relationship_description column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'entity_related_data' 
AND table_schema = 'public'
AND column_name = 'relationship_description';

-- If relationship_description doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entity_related_data' 
        AND table_schema = 'public' 
        AND column_name = 'relationship_description'
    ) THEN
        ALTER TABLE entity_related_data ADD COLUMN relationship_description TEXT;
        RAISE NOTICE 'Added relationship_description column to entity_related_data table';
    ELSE
        RAISE NOTICE 'relationship_description column already exists';
    END IF;
END $$;

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