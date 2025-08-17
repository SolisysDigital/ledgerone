-- Add short_description field to all tables that need it
-- This script adds the missing short_description column to prevent application errors

-- Function to safely add column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name text,
    column_name text,
    column_definition text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', $1, $2, $3);
        RAISE NOTICE 'Added column %I to table %I', $2, $1;
    ELSE
        RAISE NOTICE 'Column %I already exists in table %I', $2, $1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add short_description to entities table (if not already added)
SELECT add_column_if_not_exists('entities', 'short_description', 'VARCHAR(50)');

-- Add short_description to contacts table
SELECT add_column_if_not_exists('contacts', 'short_description', 'VARCHAR(100)');

-- Add short_description to emails table
SELECT add_column_if_not_exists('emails', 'short_description', 'VARCHAR(100)');

-- Add short_description to phones table
SELECT add_column_if_not_exists('phones', 'short_description', 'VARCHAR(100)');

-- Add short_description to bank_accounts table
SELECT add_column_if_not_exists('bank_accounts', 'short_description', 'VARCHAR(100)');

-- Add short_description to investment_accounts table
SELECT add_column_if_not_exists('investment_accounts', 'short_description', 'VARCHAR(100)');

-- Add short_description to crypto_accounts table
SELECT add_column_if_not_exists('crypto_accounts', 'short_description', 'VARCHAR(100)');

-- Add short_description to credit_cards table
SELECT add_column_if_not_exists('credit_cards', 'short_description', 'VARCHAR(100)');

-- Add short_description to websites table
SELECT add_column_if_not_exists('websites', 'short_description', 'VARCHAR(100)');

-- Add short_description to hosting_accounts table
SELECT add_column_if_not_exists('hosting_accounts', 'short_description', 'VARCHAR(100)');

-- Add comments to document the fields
COMMENT ON COLUMN entities.short_description IS 'Short description field with maximum 50 characters for entity summaries';
COMMENT ON COLUMN contacts.short_description IS 'Short description field for contact summaries';
COMMENT ON COLUMN emails.short_description IS 'Short description field for email summaries';
COMMENT ON COLUMN phones.short_description IS 'Short description field for phone summaries';
COMMENT ON COLUMN bank_accounts.short_description IS 'Short description field for bank account summaries';
COMMENT ON COLUMN investment_accounts.short_description IS 'Short description field for investment account summaries';
COMMENT ON COLUMN crypto_accounts.short_description IS 'Short description field for crypto account summaries';
COMMENT ON COLUMN credit_cards.short_description IS 'Short description field for credit card summaries';
COMMENT ON COLUMN websites.short_description IS 'Short description field for website summaries';
COMMENT ON COLUMN hosting_accounts.short_description IS 'Short description field for hosting account summaries';

-- Verify all columns were added successfully
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE column_name = 'short_description' 
    AND table_name IN (
        'entities', 'contacts', 'emails', 'phones', 'bank_accounts',
        'investment_accounts', 'crypto_accounts', 'credit_cards',
        'websites', 'hosting_accounts'
    )
ORDER BY table_name;

-- Clean up the helper function
DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text);

-- Summary message
DO $$
BEGIN
    RAISE NOTICE 'short_description columns have been added to all required tables';
    RAISE NOTICE 'The application should now work correctly for all CRUD operations';
END $$;
