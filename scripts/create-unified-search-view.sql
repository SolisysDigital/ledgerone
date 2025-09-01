-- Create a unified search view that combines all searchable data
-- This view will allow searching across all object types with a single query

CREATE OR REPLACE VIEW unified_search_view AS
SELECT 
    id,
    'entities' as object_type,
    'Entities' as object_type_label,
    '🏢' as icon,
    COALESCE(name, 'Unnamed Entity') as title,
    COALESCE(type, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    created_at,
    updated_at
FROM entities

UNION ALL

SELECT 
    id,
    'contacts' as object_type,
    'Contacts' as object_type_label,
    '👤' as icon,
    COALESCE(name, 'Unnamed Contact') as title,
    COALESCE(title, email, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM contacts

UNION ALL

SELECT 
    id,
    'emails' as object_type,
    'Emails' as object_type_label,
    '📧' as icon,
    COALESCE(email, 'No Email') as title,
    COALESCE(label, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM emails

UNION ALL

SELECT 
    id,
    'phones' as object_type,
    'Phones' as object_type_label,
    '📞' as icon,
    COALESCE(phone, 'No Phone') as title,
    COALESCE(label, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM phones

UNION ALL

SELECT 
    id,
    'websites' as object_type,
    'Websites' as object_type_label,
    '🌐' as icon,
    COALESCE(url, 'No URL') as title,
    COALESCE(label, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM websites

UNION ALL

SELECT 
    id,
    'bank_accounts' as object_type,
    'Bank Accounts' as object_type_label,
    '🏦' as icon,
    COALESCE(bank_name, 'Unnamed Bank Account') as title,
    CASE 
        WHEN account_number IS NOT NULL AND LENGTH(account_number) >= 4 
        THEN '****' || RIGHT(account_number, 4)
        ELSE ''
    END as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM bank_accounts

UNION ALL

SELECT 
    id,
    'investment_accounts' as object_type,
    'Investment Accounts' as object_type_label,
    '📈' as icon,
    COALESCE(provider, 'Unnamed Investment Account') as title,
    COALESCE(account_type, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM investment_accounts

UNION ALL

SELECT 
    id,
    'crypto_accounts' as object_type,
    'Crypto Accounts' as object_type_label,
    '₿' as icon,
    COALESCE(platform, 'Unnamed Crypto Account') as title,
    COALESCE(account_number, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM crypto_accounts

UNION ALL

SELECT 
    id,
    'credit_cards' as object_type,
    'Credit Cards' as object_type_label,
    '💳' as icon,
    COALESCE(cardholder_name, 'Unnamed Credit Card') as title,
    COALESCE(issuer, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM credit_cards

UNION ALL

SELECT 
    id,
    'hosting_accounts' as object_type,
    'Hosting Accounts' as object_type_label,
    '🖥️' as icon,
    COALESCE(provider, 'Unnamed Hosting Account') as title,
    COALESCE(username, '') as subtitle,
    COALESCE(short_description, description, '') as description,
    NULL as created_at,
    NULL as updated_at
FROM hosting_accounts;

-- Create an index on the view for better search performance
-- Note: PostgreSQL doesn't support indexes on views directly, but we can create indexes on the underlying tables

-- Grant permissions to the view
GRANT SELECT ON unified_search_view TO authenticated;
GRANT SELECT ON unified_search_view TO service_role;

-- Create a function for searching the unified view
CREATE OR REPLACE FUNCTION search_all_objects(search_term TEXT, page_num INTEGER DEFAULT 1, page_size INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    object_type TEXT,
    object_type_label TEXT,
    icon TEXT,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            usv.*,
            COUNT(*) OVER() as total_count
        FROM unified_search_view usv
        WHERE 
            usv.title ILIKE '%' || search_term || '%' OR
            usv.subtitle ILIKE '%' || search_term || '%' OR
            usv.description ILIKE '%' || search_term || '%'
        ORDER BY 
            -- Prioritize exact matches in title
            CASE WHEN usv.title ILIKE search_term THEN 1
                 WHEN usv.title ILIKE '%' || search_term || '%' THEN 2
                 ELSE 3 END,
            -- Then by creation date (newer first) - handle NULL values
            COALESCE(usv.created_at, '1970-01-01'::timestamptz) DESC
        LIMIT page_size
        OFFSET (page_num - 1) * page_size
    )
    SELECT * FROM search_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to the function
GRANT EXECUTE ON FUNCTION search_all_objects(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_all_objects(TEXT, INTEGER, INTEGER) TO service_role;

-- Create indexes on commonly searched fields for better performance
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities USING gin(to_tsvector('english', type));
CREATE INDEX IF NOT EXISTS idx_entities_description ON entities USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_contacts_title ON contacts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts USING gin(to_tsvector('english', email));
CREATE INDEX IF NOT EXISTS idx_contacts_description ON contacts USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_emails_email ON emails USING gin(to_tsvector('english', email));
CREATE INDEX IF NOT EXISTS idx_emails_label ON emails USING gin(to_tsvector('english', label));
CREATE INDEX IF NOT EXISTS idx_emails_description ON emails USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_phones_phone ON phones USING gin(to_tsvector('english', phone));
CREATE INDEX IF NOT EXISTS idx_phones_label ON phones USING gin(to_tsvector('english', label));
CREATE INDEX IF NOT EXISTS idx_phones_description ON phones USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_websites_url ON websites USING gin(to_tsvector('english', url));
CREATE INDEX IF NOT EXISTS idx_websites_label ON websites USING gin(to_tsvector('english', label));
CREATE INDEX IF NOT EXISTS idx_websites_description ON websites USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_name ON bank_accounts USING gin(to_tsvector('english', bank_name));
CREATE INDEX IF NOT EXISTS idx_bank_accounts_description ON bank_accounts USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_investment_accounts_provider ON investment_accounts USING gin(to_tsvector('english', provider));
CREATE INDEX IF NOT EXISTS idx_investment_accounts_account_type ON investment_accounts USING gin(to_tsvector('english', account_type));
CREATE INDEX IF NOT EXISTS idx_investment_accounts_description ON investment_accounts USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_crypto_accounts_platform ON crypto_accounts USING gin(to_tsvector('english', platform));
CREATE INDEX IF NOT EXISTS idx_crypto_accounts_description ON crypto_accounts USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_credit_cards_cardholder_name ON credit_cards USING gin(to_tsvector('english', cardholder_name));
CREATE INDEX IF NOT EXISTS idx_credit_cards_issuer ON credit_cards USING gin(to_tsvector('english', issuer));
CREATE INDEX IF NOT EXISTS idx_credit_cards_description ON credit_cards USING gin(to_tsvector('english', COALESCE(short_description, description, '')));

CREATE INDEX IF NOT EXISTS idx_hosting_accounts_provider ON hosting_accounts USING gin(to_tsvector('english', provider));
CREATE INDEX IF NOT EXISTS idx_hosting_accounts_username ON hosting_accounts USING gin(to_tsvector('english', username));
CREATE INDEX IF NOT EXISTS idx_hosting_accounts_description ON hosting_accounts USING gin(to_tsvector('english', COALESCE(short_description, description, '')));
