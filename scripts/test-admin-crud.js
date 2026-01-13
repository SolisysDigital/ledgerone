#!/usr/bin/env node

/**
 * Test CRUD operations for admin user
 * This script verifies that after RLS policy changes, the admin user
 * can still perform all CRUD operations correctly.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test data for different tables
const testData = {
  entities: {
    type: 'Person',
    name: `Test Entity ${Date.now()}`,
    short_description: 'Test entity for admin CRUD test',
    description: 'This is a test entity created by admin CRUD test script',
  },
  contacts: {
    name: `Test Contact ${Date.now()}`,
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
};

// Tables to test (excluding system tables and tables that require foreign keys)
const testableTables = [
  'entities',
  'contacts',
  'emails',
  'phones',
  'websites',
  'bank_accounts',
  'investment_accounts',
  'crypto_accounts',
  'credit_cards',
  'hosting_accounts',
];

// Track created records for cleanup
const createdRecords = {};

async function getAdminUser() {
  console.log('🔍 Looking up admin user...');
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, status')
    .eq('username', 'admin')
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('❌ Error fetching admin user:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Admin user not found. Please create an admin user first.');
  }

  console.log('✅ Admin user found:', { id: data.id, username: data.username, role: data.role });
  return data;
}

async function testCreate(table, adminUserId) {
  console.log(`\n📝 Testing CREATE for ${table}...`);
  
  const data = { ...testData[table], user_id: adminUserId };
  
  const { data: created, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(`❌ CREATE failed for ${table}:`, error);
    return { success: false, error };
  }

  if (!created) {
    console.error(`❌ CREATE returned no data for ${table}`);
    return { success: false, error: 'No data returned' };
  }

  console.log(`✅ CREATE succeeded for ${table}, ID: ${created.id}`);
  
  // Store for cleanup
  if (!createdRecords[table]) {
    createdRecords[table] = [];
  }
  createdRecords[table].push(created.id);

  return { success: true, data: created };
}

async function testRead(table, recordId) {
  console.log(`\n📖 Testing READ for ${table} (ID: ${recordId})...`);
  
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', recordId)
    .single();

  if (error) {
    console.error(`❌ READ failed for ${table}:`, error);
    return { success: false, error };
  }

  if (!data) {
    console.error(`❌ READ returned no data for ${table}`);
    return { success: false, error: 'No data returned' };
  }

  console.log(`✅ READ succeeded for ${table}`);
  return { success: true, data };
}

async function testUpdate(table, recordId, adminUserId) {
  console.log(`\n✏️  Testing UPDATE for ${table} (ID: ${recordId})...`);
  
  const updateData = {
    short_description: `Updated by admin test at ${new Date().toISOString()}`,
  };

  const { data: updated, error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error(`❌ UPDATE failed for ${table}:`, error);
    return { success: false, error };
  }

  if (!updated) {
    console.error(`❌ UPDATE returned no data for ${table}`);
    return { success: false, error: 'No data returned' };
  }

  // Verify the update
  if (updated.short_description !== updateData.short_description) {
    console.error(`❌ UPDATE verification failed for ${table}: field not updated`);
    return { success: false, error: 'Update verification failed' };
  }

  console.log(`✅ UPDATE succeeded for ${table}`);
  return { success: true, data: updated };
}

async function testDelete(table, recordId) {
  console.log(`\n🗑️  Testing DELETE for ${table} (ID: ${recordId})...`);
  
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error(`❌ DELETE failed for ${table}:`, error);
    return { success: false, error };
  }

  // Verify deletion
  const { data: deleted } = await supabase
    .from(table)
    .select('id')
    .eq('id', recordId)
    .single();

  if (deleted) {
    console.error(`❌ DELETE verification failed for ${table}: record still exists`);
    return { success: false, error: 'Delete verification failed' };
  }

  console.log(`✅ DELETE succeeded for ${table}`);
  return { success: true };
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test records...');
  
  for (const [table, ids] of Object.entries(createdRecords)) {
    for (const id of ids) {
      try {
        await supabase.from(table).delete().eq('id', id);
        console.log(`  ✅ Cleaned up ${table}:${id}`);
      } catch (error) {
        console.error(`  ❌ Failed to cleanup ${table}:${id}`, error.message);
      }
    }
  }
}

async function runTests() {
  console.log('🚀 Starting admin CRUD operations test...\n');
  console.log('='.repeat(60));

  try {
    // Get admin user
    const adminUser = await getAdminUser();
    const adminUserId = adminUser.id;

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
    };

    // Test each table
    for (const table of testableTables) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing table: ${table}`);
      console.log('='.repeat(60));

      try {
        // CREATE
        results.total++;
        const createResult = await testCreate(table, adminUserId);
        if (!createResult.success) {
          results.failed++;
          results.errors.push({ table, operation: 'CREATE', error: createResult.error });
          continue;
        }

        const recordId = createResult.data.id;

        // READ
        results.total++;
        const readResult = await testRead(table, recordId);
        if (!readResult.success) {
          results.failed++;
          results.errors.push({ table, operation: 'READ', error: readResult.error });
        } else {
          results.passed++;
        }

        // UPDATE
        results.total++;
        const updateResult = await testUpdate(table, recordId, adminUserId);
        if (!updateResult.success) {
          results.failed++;
          results.errors.push({ table, operation: 'UPDATE', error: updateResult.error });
        } else {
          results.passed++;
        }

        // DELETE
        results.total++;
        const deleteResult = await testDelete(table, recordId);
        if (!deleteResult.success) {
          results.failed++;
          results.errors.push({ table, operation: 'DELETE', error: deleteResult.error });
        } else {
          results.passed++;
        }

        // Remove from cleanup list since we already deleted it
        if (createdRecords[table]) {
          const index = createdRecords[table].indexOf(recordId);
          if (index > -1) {
            createdRecords[table].splice(index, 1);
          }
        }

      } catch (error) {
        console.error(`❌ Unexpected error testing ${table}:`, error);
        results.failed++;
        results.errors.push({ table, operation: 'UNEXPECTED', error: error.message });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total operations: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(({ table, operation, error }) => {
        console.log(`  ${table}.${operation}: ${error?.message || error}`);
      });
    }

    // Cleanup any remaining records
    await cleanup();

    // Exit with appropriate code
    if (results.failed > 0) {
      console.log('\n❌ Some tests failed. Please review the errors above.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed! Admin user CRUD operations are working correctly.');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    await cleanup();
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
