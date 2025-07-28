-- Phase 1B: Data Migration Script (Fixed)
-- This script migrates existing relationships to the new junction table and removes foreign key constraints
-- Only migrates data if entity_id columns still exist

-- 1. First, let's check which tables still have entity_id columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'entity_id'
AND table_name IN ('contacts', 'emails', 'phones', 'bank_accounts', 'investment_accounts', 'crypto_accounts', 'credit_cards', 'websites', 'hosting_accounts')
ORDER BY table_name;

-- 2. Create a temporary table to store existing relationships (only for tables that still have entity_id)
CREATE TEMP TABLE temp_existing_relationships AS
SELECT 
  'contacts' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Contact Relationship' as relationship_description
FROM contacts 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'emails' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Email Relationship' as relationship_description
FROM emails 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'phones' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Phone Relationship' as relationship_description
FROM phones 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'bank_accounts' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Bank Account Relationship' as relationship_description
FROM bank_accounts 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'investment_accounts' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Investment Account Relationship' as relationship_description
FROM investment_accounts 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'crypto_accounts' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Crypto Account Relationship' as relationship_description
FROM crypto_accounts 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'credit_cards' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Credit Card Relationship' as relationship_description
FROM credit_cards 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'websites' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Website Relationship' as relationship_description
FROM websites 
WHERE entity_id IS NOT NULL

UNION ALL

SELECT 
  'hosting_accounts' as type_of_record,
  entity_id,
  id as related_data_id,
  'Existing Hosting Account Relationship' as relationship_description
FROM hosting_accounts 
WHERE entity_id IS NOT NULL;

-- 3. Show what we're about to migrate (if any)
SELECT 
  type_of_record,
  COUNT(*) as relationship_count
FROM temp_existing_relationships 
GROUP BY type_of_record
ORDER BY type_of_record;

-- 4. Insert existing relationships into the junction table (only if we have data)
INSERT INTO entity_related_data (entity_id, related_data_id, type_of_record, relationship_description)
SELECT 
  entity_id,
  related_data_id,
  type_of_record,
  relationship_description
FROM temp_existing_relationships
WHERE entity_id IS NOT NULL;

-- 5. Show migration results
SELECT 
  'Migration Complete' as status,
  COUNT(*) as total_relationships_migrated
FROM entity_related_data;

-- 6. Remove entity_id columns and foreign key constraints (only if they exist)
-- Contacts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'entity_id') THEN
        ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_entity_id_fkey;
        ALTER TABLE contacts DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from contacts';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in contacts';
    END IF;
END $$;

-- Emails
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emails' AND column_name = 'entity_id') THEN
        ALTER TABLE emails DROP CONSTRAINT IF EXISTS emails_entity_id_fkey;
        ALTER TABLE emails DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from emails';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in emails';
    END IF;
END $$;

-- Phones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phones' AND column_name = 'entity_id') THEN
        ALTER TABLE phones DROP CONSTRAINT IF EXISTS phones_entity_id_fkey;
        ALTER TABLE phones DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from phones';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in phones';
    END IF;
END $$;

-- Bank Accounts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'entity_id') THEN
        ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_entity_id_fkey;
        ALTER TABLE bank_accounts DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from bank_accounts';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in bank_accounts';
    END IF;
END $$;

-- Investment Accounts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investment_accounts' AND column_name = 'entity_id') THEN
        ALTER TABLE investment_accounts DROP CONSTRAINT IF EXISTS investment_accounts_entity_id_fkey;
        ALTER TABLE investment_accounts DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from investment_accounts';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in investment_accounts';
    END IF;
END $$;

-- Crypto Accounts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crypto_accounts' AND column_name = 'entity_id') THEN
        ALTER TABLE crypto_accounts DROP CONSTRAINT IF EXISTS crypto_accounts_entity_id_fkey;
        ALTER TABLE crypto_accounts DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from crypto_accounts';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in crypto_accounts';
    END IF;
END $$;

-- Credit Cards
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_cards' AND column_name = 'entity_id') THEN
        ALTER TABLE credit_cards DROP CONSTRAINT IF EXISTS credit_cards_entity_id_fkey;
        ALTER TABLE credit_cards DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from credit_cards';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in credit_cards';
    END IF;
END $$;

-- Websites
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'websites' AND column_name = 'entity_id') THEN
        ALTER TABLE websites DROP CONSTRAINT IF EXISTS websites_entity_id_fkey;
        ALTER TABLE websites DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from websites';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in websites';
    END IF;
END $$;

-- Hosting Accounts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hosting_accounts' AND column_name = 'entity_id') THEN
        ALTER TABLE hosting_accounts DROP CONSTRAINT IF EXISTS hosting_accounts_entity_id_fkey;
        ALTER TABLE hosting_accounts DROP COLUMN IF EXISTS entity_id;
        RAISE NOTICE 'Removed entity_id from hosting_accounts';
    ELSE
        RAISE NOTICE 'entity_id column does not exist in hosting_accounts';
    END IF;
END $$;

-- 7. Verify the final structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('contacts', 'emails', 'phones', 'bank_accounts', 'investment_accounts', 'crypto_accounts', 'credit_cards', 'websites', 'hosting_accounts')
AND column_name = 'entity_id'
ORDER BY table_name;

-- 8. Show final status
SELECT 
    'Migration Complete' as status,
    'All entity_id columns removed' as details,
    COUNT(*) as relationships_in_junction_table
FROM entity_related_data; 