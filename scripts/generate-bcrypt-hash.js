#!/usr/bin/env node

const bcrypt = require('bcrypt');

async function generateHash(password) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Bcrypt Hash Generator');
    console.log('========================');
    console.log('');
    console.log('📝 Password:', password);
    console.log('🔑 Generated Hash:', hash);
    console.log('');
    console.log('📋 Copy this hash and use it in your SQL script:');
    console.log('');
    console.log('UPDATE users SET password_hash = \'' + hash + '\', updated_at = NOW() WHERE username = \'admin\';');
    console.log('');
    console.log('⚠️  Keep your password secure!');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
  }
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('📝 Usage: node scripts/generate-bcrypt-hash.js "YourPassword"');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/generate-bcrypt-hash.js "MySecurePassword123!"');
  console.log('');
  console.log('⚠️  Make sure to use a strong password!');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Error: Password must be at least 8 characters long');
  process.exit(1);
}

generateHash(password); 