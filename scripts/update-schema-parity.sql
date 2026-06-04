-- =====================================================
-- LEDGERONE DATABASE MIGRATION - SCHEMA PARITY UPDATE
-- This script adds the missing columns across all tables
-- to ensure full parity with tableConfigs.ts and the frontend.
-- =====================================================

-- 1. Update entities table
ALTER TABLE entities ADD COLUMN IF NOT EXISTS user_id UUID;
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

-- Officer Fields
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

-- Texas-Specific Fields
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_taxpayer_number VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_file_number VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_webfile_number VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_webfile_login VARCHAR(255);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS texas_webfile_password VARCHAR(255);


-- 2. Update bank_accounts table
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 2);


-- 3. Update investment_accounts table
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE investment_accounts ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 2);


-- 4. Update crypto_accounts table
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE crypto_accounts ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 2);


-- 5. Update credit_cards table
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS card_number VARCHAR(100);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS institution_held_at VARCHAR(255);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS purpose VARCHAR(255);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS last_balance DECIMAL(18, 2);


-- 6. Update hosting_accounts table
ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS login_url VARCHAR(500);
ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS password VARCHAR(255);


-- 7. Update securities_held table
ALTER TABLE securities_held ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE securities_held ADD COLUMN IF NOT EXISTS quantity DECIMAL(18, 6);
ALTER TABLE securities_held ADD COLUMN IF NOT EXISTS last_price DECIMAL(18, 2);


-- 8. Add user_id to other tables if not already present
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE phones ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE websites ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE entity_relationships ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE entity_related_data ADD COLUMN IF NOT EXISTS user_id UUID;


-- 9. Reload PostgREST Schema Cache
SELECT pg_notify('pgrst', 'reload schema');

SELECT 'Database schema updated successfully for parity with frontend configs!' AS status;
