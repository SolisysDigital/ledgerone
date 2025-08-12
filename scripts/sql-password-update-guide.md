# Admin Password Update via SQL

This guide shows you how to update the admin password directly in the Supabase database using SQL.

## Method 1: Using the Hash Generator Script (Recommended)

### Step 1: Generate the bcrypt hash
```bash
node scripts/generate-bcrypt-hash.js "YourNewPassword123!"
```

### Step 2: Copy the generated SQL
The script will output a complete SQL statement like:
```sql
UPDATE users SET password_hash = '$2a$10$generated.hash.here', updated_at = NOW() WHERE username = 'admin';
```

### Step 3: Run in Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Paste the generated SQL statement
4. Click **Run**

## Method 2: Manual SQL Update

### Step 1: Generate hash manually
Use an online bcrypt generator or run this in Node.js:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('YourPassword', 10);
console.log(hash);
```

### Step 2: Update the SQL script
Edit `scripts/update-admin-password.sql` and replace:
```sql
-- Replace this line with your actual hash
password_hash = '$2a$10$YOUR_NEW_BCRYPT_HASH_HERE',
```

### Step 3: Run the SQL
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `scripts/update-admin-password.sql`
3. Replace the hash with your generated hash
4. Click **Run**

## Method 3: Complete SQL Script

Here's a complete script you can use:

```sql
-- Admin Password Update Script
-- Replace 'YOUR_NEW_PASSWORD_HASH' with the actual bcrypt hash

-- Update the admin password
UPDATE users 
SET 
    password_hash = 'YOUR_NEW_PASSWORD_HASH',
    updated_at = NOW()
WHERE username = 'admin';

-- Verify the update
SELECT 
    username,
    full_name,
    role,
    status,
    updated_at
FROM users 
WHERE username = 'admin';
```

## Online Bcrypt Generators

If you don't want to use the Node.js script, you can use these online tools:

1. **bcrypt-generator.com** - https://bcrypt-generator.com/
2. **bcrypt.online** - https://bcrypt.online/

**⚠️ Security Warning**: Be careful with online tools - only use trusted ones and consider the Node.js script for better security.

## Verification

After running the SQL, you can verify the update:

```sql
-- Check if the password was updated
SELECT 
    username,
    role,
    status,
    updated_at
FROM users 
WHERE username = 'admin';
```

## Troubleshooting

### Error: "relation 'users' does not exist"
- Make sure the database migration has been run
- Check that the `users` table exists in your database

### Error: "0 rows affected"
- The admin user might not exist
- Check if the admin user exists:
```sql
SELECT * FROM users WHERE username = 'admin';
```

### Error: "permission denied"
- Make sure you're using the correct database connection
- Check your Supabase project settings

## Security Notes

1. **Keep hashes secure**: Don't share or commit bcrypt hashes
2. **Strong passwords**: Use passwords with uppercase, lowercase, numbers, and symbols
3. **Regular updates**: Consider updating passwords periodically
4. **Environment**: Make sure you're in a secure environment when generating hashes

## Quick Example

```bash
# 1. Generate hash
node scripts/generate-bcrypt-hash.js "MySecurePassword123!"

# 2. Copy the output SQL and run it in Supabase SQL Editor
# 3. Test login with the new password
```