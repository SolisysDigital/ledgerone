/**
 * Test data generators for CRUD operations
 * Provides sample data for all tables
 */

export function getTestDataForTable(table: string): Record<string, any> {
  const testData: Record<string, Record<string, any>> = {
    entities: {
      type: 'Person',
      name: 'Test Entity ' + Date.now(),
      short_description: 'Test entity description',
      description: 'This is a test entity created by automated tests',
    },
    contacts: {
      name: 'Test Contact ' + Date.now(),
      title: 'Test Title',
      email: `test${Date.now()}@example.com`,
      phone: '555-0100',
      short_description: 'Test contact',
      description: 'Test contact description',
    },
    emails: {
      email: `test${Date.now()}@example.com`,
      label: 'Test Email',
      short_description: 'Test email',
      description: 'Test email description',
    },
    phones: {
      phone: `555-${Math.floor(Math.random() * 10000)}`,
      label: 'Test Phone',
      short_description: 'Test phone',
      description: 'Test phone description',
    },
    bank_accounts: {
      bank_name: 'Test Bank',
      account_number: `ACC${Date.now()}`,
      routing_number: '123456789',
      institution_held_at: 'Test Institution',
      purpose: 'Test Purpose',
      last_balance: 1000.00,
      short_description: 'Test bank account',
      description: 'Test bank account description',
    },
    investment_accounts: {
      provider: 'Test Investment Provider',
      account_type: 'IRA',
      account_number: `INV${Date.now()}`,
      institution_held_at: 'Test Institution',
      purpose: 'Retirement',
      last_balance: 50000.00,
      short_description: 'Test investment account',
      description: 'Test investment account description',
    },
    securities_held: {
      // Note: requires investment_account_id - should be set in test
      symbol: 'TEST',
      name: 'Test Security',
      quantity: 100,
      cost_basis: 50.00,
      last_price: 55.00,
      description: 'Test security description',
    },
    crypto_accounts: {
      platform: 'Test Crypto Platform',
      account_number: `CRYPTO${Date.now()}`,
      wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
      institution_held_at: 'Test Institution',
      purpose: 'Investment',
      last_balance: 1.5,
      short_description: 'Test crypto account',
      description: 'Test crypto account description',
    },
    credit_cards: {
      cardholder_name: 'Test Cardholder',
      card_number: '4111111111111111',
      issuer: 'Test Bank',
      type: 'Visa',
      institution_held_at: 'Test Institution',
      purpose: 'Personal',
      last_balance: 500.00,
      short_description: 'Test credit card',
      description: 'Test credit card description',
    },
    websites: {
      url: `https://test${Date.now()}.example.com`,
      label: 'Test Website',
      short_description: 'Test website',
      description: 'Test website description',
    },
    hosting_accounts: {
      provider: 'Test Hosting Provider',
      login_url: `https://test${Date.now()}.example.com/login`,
      username: 'testuser',
      password: 'testpassword',
      short_description: 'Test hosting account',
      description: 'Test hosting account description',
    },
    entity_relationships: {
      // Note: requires from_entity_id and to_entity_id - should be set in test
      relationship_type: 'Test Relationship',
      description: 'Test relationship description',
    },
    entity_related_data: {
      // Note: requires entity_id, related_data_id, type_of_record - should be set in test
      relationship_description: 'Test relationship description',
    },
  };

  return testData[table] || {};
}

export function getUpdateDataForTable(table: string): Record<string, any> {
  const updateData: Record<string, Record<string, any>> = {
    entities: {
      short_description: 'Updated test entity description',
    },
    contacts: {
      title: 'Updated Title',
      email: `updated${Date.now()}@example.com`,
    },
    emails: {
      label: 'Updated Email Label',
    },
    phones: {
      label: 'Updated Phone Label',
    },
    bank_accounts: {
      bank_name: 'Updated Bank Name',
      last_balance: 2000.00,
    },
    investment_accounts: {
      provider: 'Updated Investment Provider',
      last_balance: 60000.00,
    },
    securities_held: {
      quantity: 150,
      last_price: 60.00,
    },
    crypto_accounts: {
      platform: 'Updated Crypto Platform',
      last_balance: 2.0,
    },
    credit_cards: {
      cardholder_name: 'Updated Cardholder',
      last_balance: 750.00,
    },
    websites: {
      label: 'Updated Website Label',
    },
    hosting_accounts: {
      provider: 'Updated Hosting Provider',
      username: 'updateduser',
    },
    entity_relationships: {
      relationship_type: 'Updated Relationship Type',
    },
    entity_related_data: {
      relationship_description: 'Updated relationship description',
    },
  };

  return updateData[table] || {};
}
