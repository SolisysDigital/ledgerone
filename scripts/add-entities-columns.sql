-- =====================================================
-- LEDGERONE DATABASE MIGRATION - ADD ENTITIES COLUMNS
-- This script adds the missing business/legal, officer, 
-- and Texas-specific columns to the entities table.
-- =====================================================

-- 1. Legal / Business Information Section
ALTER TABLE entities ADD COLUMN IF NOT EXISTS legal_business_name VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS employer_identification_number VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS incorporation_date DATE;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS country_of_formation VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS state_of_formation VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS business_type VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS naics_code VARCHAR(50);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS legal_address TEXT;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS mailing_address TEXT;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS registered_agent_name VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS registered_agent_address TEXT;

-- 2. Officer Fields (Optional, up to 4 officers)
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer1_name VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer1_title VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer1_ownership_percent DECIMAL(5, 2);

ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer2_name VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer2_title VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer2_ownership_percent DECIMAL(5, 2);

ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer3_name VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer3_title VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer3_ownership_percent DECIMAL(5, 2);

ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer4_name VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer4_title VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS officer4_ownership_percent DECIMAL(5, 2);

-- 3. Texas-Specific Fields (Optional)
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_taxpayer_number VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_file_number VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_webfile_number VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_webfile_login VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_webfile_password VARCHAR(255);

-- 4. Reload PostgREST Schema Cache
SELECT pg_notify('pgrst', 'reload schema');

SELECT 'Entities table columns added successfully!' AS status;
