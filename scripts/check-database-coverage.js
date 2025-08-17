#!/usr/bin/env node

/**
 * Database Coverage Check Script
 * 
 * This script ensures that all database columns are properly covered
 * in entity field specifications to prevent field omissions.
 * 
 * Usage: node scripts/check-database-coverage.js
 */

const fs = require('fs');
const path = require('path');

// Expected database schema for each entity type
const expectedSchema = {
  credit_cards: [
    'id', 'cardholder_name', 'card_number', 'issuer', 'type',
    'institution_held_at', 'purpose', 'last_balance', 'short_description',
    'description', 'created_at', 'updated_at', 'user_id'
  ],
  hosting_accounts: [
    'id', 'provider', 'login_url', 'username', 'password',
    'short_description', 'description', 'created_at', 'updated_at', 'user_id'
  ],
  crypto_accounts: [
    'id', 'platform', 'account_number', 'wallet_address',
    'institution_held_at', 'purpose', 'last_balance', 'short_description',
    'description', 'created_at', 'updated_at', 'user_id'
  ],
  investment_accounts: [
    'id', 'provider', 'account_type', 'account_number',
    'institution_held_at', 'purpose', 'last_balance', 'short_description',
    'description', 'created_at', 'updated_at', 'user_id'
  ],
  bank_accounts: [
    'id', 'bank_name', 'account_number', 'routing_number',
    'institution_held_at', 'purpose', 'last_balance', 'short_description',
    'description', 'created_at', 'updated_at', 'user_id'
  ]
};

// Critical fields that must be present
const criticalFields = ['short_description'];

function checkEntityFields(entityName, entityPath) {
  try {
    const entityFile = fs.readFileSync(entityPath, 'utf8');
    
    // Extract display fields from the file
    const displayFieldsMatch = entityFile.match(/export const \w+DisplayFields[^[]*\[([^\]]+)\]/);
    const formFieldsMatch = entityFile.match(/export const \w+FormFields[^[]*\[([^\]]+)\]/);
    
    if (!displayFieldsMatch || !formFieldsMatch) {
      console.error(`❌ ${entityName}: Could not parse field arrays`);
      return false;
    }
    
    // Parse the field arrays
    const displayFields = displayFieldsMatch[1]
      .split(',')
      .map(field => field.trim().replace(/['"]/g, ''))
      .filter(field => field.length > 0);
    
    const formFields = formFieldsMatch[1]
      .split(',')
      .map(field => field.trim().replace(/['"]/g, ''))
      .filter(field => field.length > 0);
    
    // Check if display and form fields match
    const displaySet = new Set(displayFields);
    const formSet = new Set(formFields);
    
    if (displaySet.size !== formSet.size) {
      console.error(`❌ ${entityName}: Display fields (${displaySet.size}) and form fields (${formSet.size}) have different counts`);
      return false;
    }
    
    // Check for critical fields
    const missingCriticalFields = criticalFields.filter(field => !displaySet.has(field));
    if (missingCriticalFields.length > 0) {
      console.error(`❌ ${entityName}: Missing critical fields: ${missingCriticalFields.join(', ')}`);
      return false;
    }
    
    // Check if all expected database fields are covered
    const expectedFields = expectedSchema[entityName.replace(/[A-Z]/g, (match, offset) => 
      (offset > 0 ? '_' : '') + match.toLowerCase()
    )];
    
    if (expectedFields) {
      const missingFields = expectedFields.filter(field => 
        !displaySet.has(field) && 
        !['id', 'created_at', 'updated_at', 'user_id'].includes(field)
      );
      
      if (missingFields.length > 0) {
        console.error(`❌ ${entityName}: Missing database fields: ${missingFields.join(', ')}`);
        return false;
      }
    }
    
    console.log(`✅ ${entityName}: All checks passed (${displaySet.size} fields)`);
    return true;
    
  } catch (error) {
    console.error(`❌ ${entityName}: Error reading file: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 Checking Database Coverage for Entity Field Specifications...\n');
  
  const entitiesDir = path.join(__dirname, '..', 'src', 'lib', 'entities');
  const entityFiles = fs.readdirSync(entitiesDir)
    .filter(file => file.endsWith('.fields.ts'))
    .map(file => ({
      name: file.replace('.fields.ts', '').split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      path: path.join(entitiesDir, file)
    }));
  
  let allPassed = true;
  let passedCount = 0;
  let totalCount = entityFiles.length;
  
  entityFiles.forEach(entity => {
    const passed = checkEntityFields(entity.name, entity.path);
    if (passed) passedCount++;
    else allPassed = false;
  });
  
  console.log(`\n📊 Summary: ${passedCount}/${totalCount} entities passed`);
  
  if (allPassed) {
    console.log('🎉 All database coverage checks passed!');
    process.exit(0);
  } else {
    console.log('❌ Some database coverage checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkEntityFields, expectedSchema };
