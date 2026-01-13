# Testing Admin CRUD Operations

This document explains how to test that CRUD operations work correctly for the admin user after the RLS policy changes.

## Overview

After applying the hardened RLS policies, we need to verify that:
1. The admin user can log in successfully
2. The admin user's session is created correctly
3. All CRUD operations (Create, Read, Update, Delete) work for the admin user
4. The `user_id` field is correctly set on created records

## Important Notes

### How CRUD Operations Work

The CRUD operations in `src/lib/actions.ts` use:
- `getServiceSupabase()` - This uses the service role key which **bypasses RLS entirely**
- `getCurrentUserId()` - This reads the user ID from the session cookie

This means:
- ✅ CRUD operations should work regardless of RLS policies (they bypass RLS)
- ✅ The `user_id` is set from the session cookie
- ⚠️ If the session cookie is missing or invalid, operations will fail

### RLS Policy Impact

The hardened RLS policies require `user_id IS NOT NULL` for authenticated users. However:
- CRUD operations bypass RLS (use service role)
- Direct database queries would be restricted by RLS
- Admin users don't have special RLS permissions in the current policies

## Testing Steps

### Step 1: Ensure Admin User Exists

```bash
# Check if admin user exists (you'll need to run this in your database)
# Or use the create-admin-user script:
node scripts/create-admin-user.js admin "YourPassword123!" "System Administrator"
```

### Step 2: Run the Test Script

```bash
# Make sure your .env.local file has the required variables:
# NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...

# Run the test script
node scripts/test-admin-crud.js
```

The test script will:
1. Look up the admin user in the database
2. Test CREATE operations for all tables
3. Test READ operations
4. Test UPDATE operations
5. Test DELETE operations
6. Clean up all test records

### Step 3: Manual Testing via UI

1. **Login as Admin**
   - Go to `/login`
   - Enter username: `admin`
   - Enter password: (your admin password)
   - Verify login succeeds

2. **Test Create Operation**
   - Navigate to any table (e.g., `/entities/new`)
   - Fill in the form and submit
   - Verify the record is created successfully

3. **Test Read Operation**
   - Navigate to a table list (e.g., `/entities`)
   - Verify records are displayed
   - Click on a record to view details

4. **Test Update Operation**
   - Navigate to a record's edit page (e.g., `/entities/[id]/edit`)
   - Modify some fields and save
   - Verify changes are saved

5. **Test Delete Operation**
   - Navigate to a record's detail page
   - Click delete
   - Verify the record is deleted

## Potential Issues and Solutions

### Issue 1: "Authentication required to create records"

**Cause:** `getCurrentUserId()` returns `null` (no valid session)

**Solution:**
- Ensure you're logged in
- Check that the session cookie is set correctly
- Verify the session hasn't expired (24 hour limit)

### Issue 2: Records created but `user_id` is NULL

**Cause:** `getCurrentUserId()` returns `null` during creation

**Solution:**
- Check session cookie is valid
- Verify `getCurrentUserId()` is working correctly
- Check server logs for session errors

### Issue 3: RLS Policy Errors

**Cause:** Direct database queries (not using service role) are blocked by RLS

**Solution:**
- CRUD operations should use `getServiceSupabase()` (bypasses RLS)
- If you see RLS errors, check that operations are using service role
- For direct DB access, admin users may need special RLS policies

## Expected Test Results

When running `test-admin-crud.js`, you should see:

```
✅ Admin user found: { id: '...', username: 'admin', role: 'admin' }
✅ CREATE succeeded for entities, ID: ...
✅ READ succeeded for entities
✅ UPDATE succeeded for entities
✅ DELETE succeeded for entities
...
✅ All tests passed! Admin user CRUD operations are working correctly.
```

## Troubleshooting

### Test Script Fails with "Admin user not found"

1. Create the admin user:
   ```bash
   node scripts/create-admin-user.js admin "YourPassword123!" "System Administrator"
   ```

2. Verify the user exists in the database:
   ```sql
   SELECT id, username, role, status FROM users WHERE username = 'admin';
   ```

### Test Script Fails with "Missing Supabase environment variables"

1. Create `.env.local` file in the project root
2. Add required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### CRUD Operations Fail in UI

1. Check browser console for errors
2. Check server logs for detailed error messages
3. Verify session cookie is set (check browser DevTools → Application → Cookies)
4. Try logging out and logging back in

## Additional Notes

- The test script uses the service role key directly, so it bypasses RLS
- This is the same approach used by the actual CRUD operations
- The test verifies that operations work when `user_id` is set correctly
- If tests pass, the admin user should be able to perform all CRUD operations via the UI
