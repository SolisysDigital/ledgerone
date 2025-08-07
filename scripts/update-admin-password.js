#!/usr/bin/env node

const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateAdminPassword(newPassword) {
  try {
    console.log('🔐 Updating admin password...');
    
    // Generate bcrypt hash with salt rounds of 10
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('✅ Password hash generated successfully');
    
    // Update the admin user's password in the database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('username', 'admin')
      .select();

    if (error) {
      console.error('❌ Error updating admin password:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('📝 Username: admin');
      console.log('🔑 New password:', newPassword);
      console.log('⚠️  Please keep this password secure and don\'t share it');
    } else {
      console.error('❌ Error: Admin user not found in database');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const newPassword = process.argv[2];
  
  if (!newPassword) {
    console.log('📝 Usage: node scripts/update-admin-password.js <new-password>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/update-admin-password.js "MySecurePassword123!"');
    console.log('');
    console.log('⚠️  Make sure to use a strong password with:');
    console.log('   - At least 8 characters');
    console.log('   - Mix of uppercase, lowercase, numbers, and symbols');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  console.log('🚀 Starting admin password update...');
  console.log('📝 New password length:', newPassword.length, 'characters');
  console.log('');

  await updateAdminPassword(newPassword);
  
  console.log('');
  console.log('🎉 Password update completed successfully!');
  console.log('🔗 You can now log in to your application with the new password');
}

// Run the script
main().catch(console.error); 