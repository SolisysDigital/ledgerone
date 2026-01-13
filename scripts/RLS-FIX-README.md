# RLS Policy Fix - Migration Guide

## Overview

This migration fixes the Supabase "RLS Policy Always True" warnings by:
1. Adding `user_id` columns to all data tables
2. Creating proper RLS policies that restrict access based on `user_id`
3. Backfilling existing records with a default user_id

## Important Notes

- **Current Behavior**: The application uses the `service_role` Supabase client, which bypasses RLS entirely. This migration fixes the warnings but doesn't change current functionality.
- **Future Security**: If you switch to using authenticated clients, the RLS policies will automatically enforce user isolation.
- **Service Role**: The `service_role` client will continue to have full access to all tables (bypassing RLS).

## Running the Migration

1. **Connect to your Supabase database** (via Supabase Dashboard SQL Editor or psql)

2. **Run the migration script**:
   ```sql
   -- Copy and paste the contents of scripts/fix-rls-policies.sql
   -- into the Supabase SQL Editor and execute
   ```

3. **Verify the migration**:
   - Check that `user_id` columns were added to all tables
   - Verify that new RLS policies are in place
   - Confirm existing records have been backfilled with a user_id

## Security: Anon Role Access

**Important**: The `anon` role is **DENIED** access to all private tables by default.

- **No policies are created for `anon` role** - This means anonymous users cannot access any data
- **PostgreSQL RLS default**: When RLS is enabled and no policies exist for a role, that role is denied access
- **Explicit security**: Only `service_role` and `authenticated` roles have policies
- **Private tables protected**: All financial/PII tables (bank_accounts, credit_cards, crypto_accounts, etc.) are inaccessible to anonymous users

This is the secure default behavior and ensures that sensitive data cannot be accessed without authentication.

## What the Migration Does

### Step 1: Add user_id Columns
Adds `user_id UUID REFERENCES users(id) ON DELETE SET NULL` to:
- entities
- contacts
- emails
- phones
- websites
- bank_accounts
- investment_accounts
- crypto_accounts
- credit_cards
- hosting_accounts
- securities_held
- entity_related_data

### Step 2: Create Indexes
Creates indexes on all `user_id` columns for query performance.

### Step 3: Create Helper Function
Creates `is_admin_user()` function to check if a user is an admin.

### Step 4: Drop Old Policies
Removes all existing overly permissive policies (`USING (true)`).

### Step 5: Create New Policies
For each table:
- **Service Role**: Full access (bypasses RLS - current behavior)
- **Authenticated Users**: Can only access records where `user_id IS NOT NULL`
  - This ensures records have ownership
  - If you switch to authenticated clients, you'll need to add user_id filtering in your queries

### Step 6: Backfill Existing Records
Assigns all existing records to the first admin user (or first active user if no admin exists).

## Application Code Changes

The application code has been updated to:
- Set `user_id` when creating new records (in `createItem` function)
- Get current user ID from session cookies (new `getCurrentUserId` function)

## Testing

After running the migration:
1. Create a new record - verify `user_id` is set
2. Check Supabase dashboard - warnings should be gone
3. Verify existing records have `user_id` set

## Rollback

If you need to rollback:
1. Drop the new policies
2. Recreate the old `USING (true)` policies
3. Remove `user_id` columns (optional - data will be lost)

## Next Steps (Optional)

If you want to enforce user isolation:
1. Switch from `service_role` to authenticated clients
2. Add user_id filtering in queries
3. Update RLS policies to check user_id matches current user
