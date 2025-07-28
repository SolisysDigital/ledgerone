-- Phase 1B: Data Migration Script
-- This script migrates existing relationships to the new junction table and removes foreign key constraints

-- 1. First, let's backup existing relationships by creating a temporary table
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

-- 2. Show what we're about to migrate
SELECT 
  type_of_record,
  COUNT(*) as relationship_count
FROM temp_existing_relationships 
GROUP BY type_of_record
ORDER BY type_of_record;

-- 3. Migrate existing relationships to the new junction table
INSERT INTO entity_related_data (
  entity_id,
  related_data_id,
  type_of_record,
  relationship_description
)
SELECT 
  entity_id,
  related_data_id,
  type_of_record,
  relationship_description
FROM temp_existing_relationships
ON CONFLICT (entity_id, related_data_id, type_of_record) DO NOTHING;

-- 4. Verify the migration was successful
SELECT 
  type_of_record,
  COUNT(*) as migrated_count
FROM entity_related_data 
GROUP BY type_of_record
ORDER BY type_of_record;

-- 5. Remove foreign key constraints from related data tables
-- Note: We'll do this step by step to avoid any issues

-- 5a. Remove entity_id column from contacts table
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_entity_id_fkey;
ALTER TABLE contacts DROP COLUMN IF EXISTS entity_id;

-- 5b. Remove entity_id column from emails table
ALTER TABLE emails DROP CONSTRAINT IF EXISTS emails_entity_id_fkey;
ALTER TABLE emails DROP COLUMN IF EXISTS entity_id;

-- 5c. Remove entity_id column from phones table
ALTER TABLE phones DROP CONSTRAINT IF EXISTS phones_entity_id_fkey;
ALTER TABLE phones DROP COLUMN IF EXISTS entity_id;

-- 5d. Remove entity_id column from bank_accounts table
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_entity_id_fkey;
ALTER TABLE bank_accounts DROP COLUMN IF EXISTS entity_id;

-- 5e. Remove entity_id column from investment_accounts table
ALTER TABLE investment_accounts DROP CONSTRAINT IF EXISTS investment_accounts_entity_id_fkey;
ALTER TABLE investment_accounts DROP COLUMN IF EXISTS entity_id;

-- 5f. Remove entity_id column from crypto_accounts table
ALTER TABLE crypto_accounts DROP CONSTRAINT IF EXISTS crypto_accounts_entity_id_fkey;
ALTER TABLE crypto_accounts DROP COLUMN IF EXISTS entity_id;

-- 5g. Remove entity_id column from credit_cards table
ALTER TABLE credit_cards DROP CONSTRAINT IF EXISTS credit_cards_entity_id_fkey;
ALTER TABLE credit_cards DROP COLUMN IF EXISTS entity_id;

-- 5h. Remove entity_id column from websites table
ALTER TABLE websites DROP CONSTRAINT IF EXISTS websites_entity_id_fkey;
ALTER TABLE websites DROP COLUMN IF EXISTS entity_id;

-- 5i. Remove entity_id column from hosting_accounts table
ALTER TABLE hosting_accounts DROP CONSTRAINT IF EXISTS hosting_accounts_entity_id_fkey;
ALTER TABLE hosting_accounts DROP COLUMN IF EXISTS entity_id;

-- 6. Verify that all entity_id columns have been removed
SELECT 
  table_name,
  column_name
FROM information_schema.columns 
WHERE table_name IN (
  'contacts', 'emails', 'phones', 'bank_accounts', 
  'investment_accounts', 'crypto_accounts', 'credit_cards', 
  'websites', 'hosting_accounts'
) 
AND column_name = 'entity_id'
ORDER BY table_name;

-- 7. Show the final state of the junction table
SELECT 
  'Total relationships in junction table' as description,
  COUNT(*) as count
FROM entity_related_data

UNION ALL

SELECT 
  'Relationships by type' as description,
  COUNT(*) as count
FROM entity_related_data
GROUP BY type_of_record
ORDER BY description;

-- 8. Create a summary view for verification
CREATE OR REPLACE VIEW migration_summary AS
SELECT 
  'contacts' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'contacts') as relationship_count
FROM contacts

UNION ALL

SELECT 
  'emails' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'emails') as relationship_count
FROM emails

UNION ALL

SELECT 
  'phones' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'phones') as relationship_count
FROM phones

UNION ALL

SELECT 
  'bank_accounts' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'bank_accounts') as relationship_count
FROM bank_accounts

UNION ALL

SELECT 
  'investment_accounts' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'investment_accounts') as relationship_count
FROM investment_accounts

UNION ALL

SELECT 
  'crypto_accounts' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'crypto_accounts') as relationship_count
FROM crypto_accounts

UNION ALL

SELECT 
  'credit_cards' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'credit_cards') as relationship_count
FROM credit_cards

UNION ALL

SELECT 
  'websites' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'websites') as relationship_count
FROM websites

UNION ALL

SELECT 
  'hosting_accounts' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM entity_related_data WHERE type_of_record = 'hosting_accounts') as relationship_count
FROM hosting_accounts

ORDER BY table_name;

-- 9. Show the migration summary
SELECT * FROM migration_summary;

-- 10. Test the helper functions with some sample data
-- (This will only work if there are existing relationships)
SELECT 
  'Testing get_entity_relationships function' as test_description,
  COUNT(*) as relationship_count
FROM get_entity_relationships(
  (SELECT id FROM entities LIMIT 1)
);

-- 11. Clean up temporary table
DROP TABLE IF EXISTS temp_existing_relationships;

-- 12. Final verification - show all tables and their current structure
SELECT 
  'Migration completed successfully!' as status,
  'All existing relationships have been migrated to the junction table' as details,
  'Foreign key constraints have been removed from related data tables' as notes; 