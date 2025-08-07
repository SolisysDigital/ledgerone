# Admin Password Update Script

This script allows you to update the default admin password for the LedgerOne application.

## Prerequisites

1. **Environment Variables**: Make sure your `.env` file contains the Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Dependencies**: Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

### Method 1: Using npm script
```bash
npm run update-admin-password "YourNewPassword123!"
```

### Method 2: Direct node execution
```bash
node scripts/update-admin-password.js "YourNewPassword123!"
```

## Password Requirements

- **Minimum length**: 8 characters
- **Recommended**: Use a strong password with:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)

## Example

```bash
# Update admin password to a secure password
npm run update-admin-password "MySecurePassword123!"

# Output:
# 🚀 Starting admin password update...
# 📝 New password length: 19 characters
# 
# 🔐 Updating admin password...
# ✅ Password hash generated successfully
# ✅ Admin password updated successfully!
# 📝 Username: admin
# 🔑 New password: MySecurePassword123!
# ⚠️  Please keep this password secure and don't share it
# 
# 🎉 Password update completed successfully!
# 🔗 You can now log in to your application with the new password
```

## Security Notes

1. **Keep it secure**: Don't share your admin password with others
2. **Strong passwords**: Use a combination of letters, numbers, and symbols
3. **Regular updates**: Consider updating the password periodically
4. **Environment**: Make sure you're running this in a secure environment

## Troubleshooting

### Error: Missing Supabase environment variables
- Ensure your `.env` file exists and contains the correct Supabase credentials
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Error: Password too short
- Use a password with at least 8 characters

### Error: Admin user not found
- Ensure the database migration has been run and the admin user exists
- Check that your Supabase connection is working

### Error: Database connection issues
- Verify your Supabase URL and API key are correct
- Check your internet connection
- Ensure your Supabase project is active

## Database Schema

The script updates the `users` table in your Supabase database:

```sql
UPDATE users 
SET password_hash = 'bcrypt_hash_here', updated_at = NOW()
WHERE username = 'admin';
```

The password is hashed using bcrypt with 10 salt rounds for security. 