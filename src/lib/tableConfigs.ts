export type FieldConfig = {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'fk';
  label?: string; // custom label for display
  options?: string[]; // for select
  refTable?: string; // for fk
  displayField?: string; // for fk
};

export type ParentConfig = {
  table: string;
  fk: string;
  displayField?: string;
};

export type ChildConfig = {
  table: string;
  fk: string;
};

export type TableConfig = {
  label: string;
  fields: FieldConfig[];
  parent?: ParentConfig;
  children?: ChildConfig[];
};

export const tableConfigs: Record<string, TableConfig> = {
  entities: {
    label: 'Entities',
    fields: [
      { name: 'type', type: 'select', label: 'Type of Entity', options: ['Person', 'Business'] },
      { name: 'name', type: 'text', label: 'Entity Name' },
      { name: 'short_description', type: 'text' },
      { name: 'description', type: 'textarea' },
      // Legal Info Section
      { name: 'legal_business_name', type: 'text' },
      { name: 'employer_identification_number', type: 'text' },
      { name: 'incorporation_date', type: 'date' },
      { name: 'country_of_formation', type: 'select', options: ['USA', 'Canada', 'India'] },
      { name: 'state_of_formation', type: 'select', options: [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'] },
      { name: 'business_type', type: 'select', options: ['Single-LLC', 'LLC', 'S-Corp', 'C-Corp'] },
      { name: 'industry', type: 'text' },
      { name: 'naics_code', type: 'text' },
      { name: 'legal_address', type: 'text' },
      { name: 'mailing_address', type: 'text' },
      { name: 'registered_agent_name', type: 'text' },
      { name: 'registered_agent_address', type: 'text' },
      // Officer fields (optional, up to 4 officers - enter any combination of 1-4)
      { name: 'officer1_name', type: 'text' },
      { name: 'officer1_title', type: 'text' },
      { name: 'officer1_ownership_percent', type: 'number' },
      { name: 'officer2_name', type: 'text' },
      { name: 'officer2_title', type: 'text' },
      { name: 'officer2_ownership_percent', type: 'number' },
      { name: 'officer3_name', type: 'text' },
      { name: 'officer3_title', type: 'text' },
      { name: 'officer3_ownership_percent', type: 'number' },
      { name: 'officer4_name', type: 'text' },
      { name: 'officer4_title', type: 'text' },
      { name: 'officer4_ownership_percent', type: 'number' },
      // Texas-specific fields (optional, conditionally shown in UI)
      { name: 'texas_taxpayer_number', type: 'text' },
      { name: 'texas_file_number', type: 'text' },
      { name: 'texas_webfile_number', type: 'text' },
      { name: 'texas_webfile_login', type: 'text' },
      { name: 'texas_webfile_password', type: 'text' },
    ],
    // Removed children configuration since we now use many-to-many relationships
  },
  contacts: {
    label: 'Contacts',
    fields: [
      { name: 'name', type: 'text' },
      { name: 'title', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
  },
  emails: {
    label: 'Emails',
    fields: [
      { name: 'email', type: 'text' },
      { name: 'label', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
  },
  phones: {
    label: 'Phones',
    fields: [
      { name: 'phone', type: 'text' },
      { name: 'label', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
  },
  bank_accounts: {
    label: 'Bank Accounts',
    fields: [
      { name: 'bank_name', type: 'text' },
      { name: 'account_number', type: 'text' },
      { name: 'routing_number', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
  },
  investment_accounts: {
    label: 'Investment Accounts',
    fields: [
      { name: 'provider', type: 'text' },
      { name: 'account_type', type: 'text' },
      { name: 'account_number', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
    children: [
      { table: 'securities_held', fk: 'investment_account_id' },
    ],
  },
  securities_held: {
    label: 'Securities Held',
    fields: [
      { name: 'investment_account_id', type: 'fk', refTable: 'investment_accounts', displayField: 'account_number' },
      { name: 'symbol', type: 'text' },
      { name: 'name', type: 'text' },
      { name: 'quantity', type: 'number' },
      { name: 'cost_basis', type: 'number' },
      { name: 'last_price', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'investment_accounts', fk: 'investment_account_id' },
  },
  crypto_accounts: {
    label: 'Crypto Accounts',
    fields: [
      { name: 'platform', type: 'text' },
      { name: 'account_number', type: 'text' },
      { name: 'wallet_address', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
  },
  credit_cards: {
    label: 'Credit Cards',
    fields: [
      { name: 'cardholder_name', type: 'text' },
      { name: 'card_number', type: 'text' },
      { name: 'issuer', type: 'text' },
      { name: 'type', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
  },
  websites: {
    label: 'Websites',
    fields: [
      { name: 'url', type: 'text' },
      { name: 'label', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
  },
  hosting_accounts: {
    label: 'Hosting Accounts',
    fields: [
      { name: 'provider', type: 'text' },
      { name: 'login_url', type: 'text' },
      { name: 'username', type: 'text' },
      { name: 'password', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
  },
  entity_relationships: {
    label: 'Entity Relationships',
    fields: [
      { name: 'from_entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'to_entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'relationship_type', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
  },
  entity_related_data: {
    label: 'Entity Related Data',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'related_data_id', type: 'text' },
      { name: 'type_of_record', type: 'select', options: [
        'contacts', 'emails', 'phones', 'bank_accounts', 
        'investment_accounts', 'crypto_accounts', 'credit_cards', 
        'websites', 'hosting_accounts'
      ]},
      { name: 'relationship_description', type: 'textarea' },
    ],
  },
};