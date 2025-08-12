-- Admin Password Update Script for Supabase
-- Run this in your Supabase SQL Editor

-- Step 1: Generate a bcrypt hash for your new password
-- You can use an online bcrypt generator or run this in a Node.js environment
-- For example, if your new password is "MySecurePassword123!", the hash would be something like:
-- $2a$10$rQZ9vKzqX8mN3pL2sJ1hA.BCDEFGHIJKLMNOPQRSTUVWXYZabcdef

-- Step 2: Update the admin user's password
UPDATE users 
SET 
    password_hash = '$2a$10$YOUR_NEW_BCRYPT_HASH_HERE',  -- Replace with your actual bcrypt hash
    updated_at = NOW()
WHERE username = 'admin';

-- Step 3: Verify the update
SELECT 
    username,
    full_name,
    role,
    status,
    updated_at
FROM users 
WHERE username = 'admin';

-- Alternative: If you want to see all users (for verification)
-- SELECT username, role, status, created_at, updated_at FROM users; 