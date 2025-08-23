#!/usr/bin/env node

const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for administrative operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdminUser(username, password, fullName) {
  try {
    console.log('🔐 Creating admin user...');
    
    // Generate bcrypt hash with salt rounds of 10
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Password hash generated successfully');
    
    // Use the secure database function to create admin user
    const { data, error } = await supabase
      .rpc('create_admin_user', {
        p_username: username,
        p_password_hash: passwordHash,
        p_full_name: fullName
      });

    if (error) {
      console.error('❌ Error creating admin user:', error);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('📝 Username:', username);
    console.log('🔑 Password:', password);
    console.log('👤 Full Name:', fullName);
    console.log('⚠️  Please keep this password secure and don\'t share it');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const fullName = process.argv[4] || 'System Administrator';
  
  if (!username || !password) {
    console.log('📝 Usage: node scripts/create-admin-user.js <username> <password> [full-name]');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/create-admin-user.js "admin" "MySecurePassword123!" "System Administrator"');
    console.log('');
    console.log('⚠️  Make sure to use a strong password with:');
    console.log('   - At least 8 characters');
    console.log('   - Mix of uppercase, lowercase, numbers, and symbols');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  console.log('🚀 Starting admin user creation...');
  console.log('📝 Username:', username);
  console.log('🔑 Password length:', password.length, 'characters');
  console.log('👤 Full Name:', fullName);
  console.log('');

  await createAdminUser(username, password, fullName);
  
  console.log('');
  console.log('🎉 Admin user creation completed successfully!');
  console.log('🔗 You can now log in to your application with the new credentials');
}

// Run the script
main().catch(console.error);
