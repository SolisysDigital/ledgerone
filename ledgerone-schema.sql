
-- Table: entities
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('person', 'business')),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Table: legal_information
CREATE TABLE legal_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    legal_name TEXT,
    tax_id TEXT,
    dob DATE,
    incorporation_date DATE,
    country TEXT,
    description TEXT
);

-- Table: contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    name TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    description TEXT
);

-- Table: emails
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    email TEXT,
    label TEXT,
    description TEXT
);

-- Table: phones
CREATE TABLE phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    phone TEXT,
    label TEXT,
    description TEXT
);

-- Table: bank_accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    bank_name TEXT,
    account_number TEXT,
    routing_number TEXT,
    institution_held_at TEXT,
    purpose TEXT,
    last_balance NUMERIC,
    description TEXT
);

-- Table: investment_accounts
CREATE TABLE investment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    provider TEXT,
    account_type TEXT,
    account_number TEXT,
    institution_held_at TEXT,
    purpose TEXT,
    last_balance NUMERIC,
    description TEXT
);

-- Table: securities_held
CREATE TABLE securities_held (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_account_id UUID REFERENCES investment_accounts(id) ON DELETE CASCADE,
    symbol TEXT,
    name TEXT,
    quantity NUMERIC,
    cost_basis NUMERIC,
    last_price NUMERIC,
    description TEXT
);

-- Table: crypto_accounts
CREATE TABLE crypto_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    platform TEXT,
    account_number TEXT,
    wallet_address TEXT,
    institution_held_at TEXT,
    purpose TEXT,
    last_balance NUMERIC,
    description TEXT
);

-- Table: credit_cards
CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    cardholder_name TEXT,
    card_number TEXT,
    issuer TEXT,
    type TEXT,
    institution_held_at TEXT,
    purpose TEXT,
    last_balance NUMERIC,
    description TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Table: websites
CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    url TEXT,
    label TEXT,
    description TEXT
);

-- Table: hosting_accounts
CREATE TABLE hosting_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    provider TEXT,
    login_url TEXT,
    username TEXT,
    password TEXT,
    description TEXT
);

-- Table: entity_relationships
CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    to_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type TEXT,
    description TEXT
);
