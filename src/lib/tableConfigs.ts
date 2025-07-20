export type FieldConfig = {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'fk';
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
      { name: 'type', type: 'select', options: ['person', 'business'] },
      { name: 'name', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
    children: [
      { table: 'legal_information', fk: 'entity_id' },
      { table: 'contacts', fk: 'entity_id' },
      { table: 'emails', fk: 'entity_id' },
      { table: 'phones', fk: 'entity_id' },
      { table: 'bank_accounts', fk: 'entity_id' },
      { table: 'investment_accounts', fk: 'entity_id' },
      { table: 'crypto_accounts', fk: 'entity_id' },
      { table: 'credit_cards', fk: 'entity_id' },
      { table: 'websites', fk: 'entity_id' },
      { table: 'hosting_accounts', fk: 'entity_id' },
    ],
  },
  legal_information: {
    label: 'Legal Information',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'legal_name', type: 'text' },
      { name: 'tax_id', type: 'text' },
      { name: 'dob', type: 'date' },
      { name: 'incorporation_date', type: 'date' },
      { name: 'country', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  contacts: {
    label: 'Contacts',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'name', type: 'text' },
      { name: 'title', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  emails: {
    label: 'Emails',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'email', type: 'text' },
      { name: 'label', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  phones: {
    label: 'Phones',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'phone', type: 'text' },
      { name: 'label', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  bank_accounts: {
    label: 'Bank Accounts',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'bank_name', type: 'text' },
      { name: 'account_number', type: 'text' },
      { name: 'routing_number', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  investment_accounts: {
    label: 'Investment Accounts',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'provider', type: 'text' },
      { name: 'account_type', type: 'text' },
      { name: 'account_number', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
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
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'platform', type: 'text' },
      { name: 'account_number', type: 'text' },
      { name: 'wallet_address', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  credit_cards: {
    label: 'Credit Cards',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'cardholder_name', type: 'text' },
      { name: 'card_number', type: 'text' },
      { name: 'issuer', type: 'text' },
      { name: 'type', type: 'text' },
      { name: 'institution_held_at', type: 'text' },
      { name: 'purpose', type: 'text' },
      { name: 'last_balance', type: 'number' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  websites: {
    label: 'Websites',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'url', type: 'text' },
      { name: 'label', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
  },
  hosting_accounts: {
    label: 'Hosting Accounts',
    fields: [
      { name: 'entity_id', type: 'fk', refTable: 'entities', displayField: 'name' },
      { name: 'provider', type: 'text' },
      { name: 'login_url', type: 'text' },
      { name: 'username', type: 'text' },
      { name: 'password', type: 'text' },
      { name: 'description', type: 'textarea' },
    ],
    parent: { table: 'entities', fk: 'entity_id' },
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
};