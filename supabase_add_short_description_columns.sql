-- Add short_description field to all tables that need it
-- Run this script in Supabase SQL Editor to fix the missing column errors

-- Add short_description to entities table (if not already added)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entities' AND column_name = 'short_description') THEN
        ALTER TABLE entities ADD COLUMN short_description VARCHAR(50);
        RAISE NOTICE 'Added short_description column to entities table';
    ELSE
        RAISE NOTICE 'short_description column already exists in entities table';
    END IF;
END $$;

-- Add short_description to contacts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'short_description') THEN
        ALTER TABLE contacts ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to contacts table';
    ELSE
        RAISE NOTICE 'short_description column already exists in contacts table';
    END IF;
END $$;

-- Add short_description to emails table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emails' AND column_name = 'short_description') THEN
        ALTER TABLE emails ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to emails table';
    ELSE
        RAISE NOTICE 'short_description column already exists in emails table';
    END IF;
END $$;

-- Add short_description to phones table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phones' AND column_name = 'short_description') THEN
        ALTER TABLE phones ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to phones table';
    ELSE
        RAISE NOTICE 'short_description column already exists in phones table';
    END IF;
END $$;

-- Add short_description to bank_accounts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'short_description') THEN
        ALTER TABLE bank_accounts ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to bank_accounts table';
    ELSE
        RAISE NOTICE 'short_description column already exists in bank_accounts table';
    END IF;
END $$;

-- Add short_description to investment_accounts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investment_accounts' AND column_name = 'short_description') THEN
        ALTER TABLE investment_accounts ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to investment_accounts table';
    ELSE
        RAISE NOTICE 'short_description column already exists in investment_accounts table';
    END IF;
END $$;

-- Add short_description to crypto_accounts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crypto_accounts' AND column_name = 'short_description') THEN
        ALTER TABLE crypto_accounts ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to crypto_accounts table';
    ELSE
        RAISE NOTICE 'short_description column already exists in crypto_accounts table';
    END IF;
END $$;

-- Add short_description to credit_cards table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_cards' AND column_name = 'short_description') THEN
        ALTER TABLE credit_cards ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to credit_cards table';
    ELSE
        RAISE NOTICE 'short_description column already exists in credit_cards table';
    END IF;
END $$;

-- Add short_description to websites table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'websites' AND column_name = 'short_description') THEN
        ALTER TABLE websites ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to websites table';
    ELSE
        RAISE NOTICE 'short_description column already exists in websites table';
    END IF;
END $$;

-- Add short_description to hosting_accounts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hosting_accounts' AND column_name = 'short_description') THEN
        ALTER TABLE hosting_accounts ADD COLUMN short_description VARCHAR(100);
        RAISE NOTICE 'Added short_description column to hosting_accounts table';
    ELSE
        RAISE NOTICE 'short_description column already exists in hosting_accounts table';
    END IF;
END $$;

-- Add helpful comments to document the fields
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

-- Final success message
SELECT 'short_description columns have been added to all required tables. The application should now work correctly for all CRUD operations!' as status;
