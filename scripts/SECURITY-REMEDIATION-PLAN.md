# 🔒 Security Remediation Plan

## Executive Summary

Supabase has identified **7 security issues** in the database that need to be addressed:
- **6 SECURITY DEFINER concerns** (ERROR level)
- **1 RLS disabled table** (ERROR level)

This document provides a comprehensive plan to fix all issues while maintaining application functionality.

---

## 📊 Issues Breakdown

### Issue 1: SECURITY DEFINER Views/Functions (6 instances)

**Severity:** ERROR  
**Risk Level:** HIGH  
**Category:** SECURITY

**Affected Resources:**
1. `unified_search_view` - View for global search
2. `users_public` - View for user data
3. `recent_errors` - View for error logs
4. `migration_summary` - View for migration tracking
5. `debug_logs` - View for debug information
6. `entity_relationships_view` - View for entity relationships

**Problem:**
Functions/views with `SECURITY DEFINER` execute with the privileges of the user who created them, bypassing Row Level Security (RLS) policies. This can lead to unauthorized data access.

**Root Cause:**
Some functions were created with `SECURITY DEFINER` to bypass permission issues, but this is a security anti-pattern in Supabase.

---

### Issue 2: RLS Disabled on Public Table

**Severity:** ERROR  
**Risk Level:** HIGH  
**Category:** SECURITY

**Affected Resource:**
- `securities_held` table

**Problem:**
Table is publicly accessible via PostgREST API but has no Row Level Security policies, allowing unrestricted access to all data.

**Root Cause:**
RLS was not enabled when the table was created.

---

## 🎯 Remediation Strategy

### Phase 1: Remove SECURITY DEFINER from Functions
**Duration:** Immediate  
**Risk:** Low (with proper testing)

**Actions:**
1. ✅ Replace `SECURITY DEFINER` with `SECURITY INVOKER` on `search_all_objects` function
2. ✅ Keep `SECURITY DEFINER` on admin functions (`create_admin_user`, `update_admin_password`) but:
   - Add `SET search_path = public` to prevent search path attacks
   - Restrict execution to `service_role` only
   - Add audit logging for all admin operations
3. ✅ Recreate all views without `SECURITY DEFINER` (views don't actually use this, but ensuring clean state)

**Why This Works:**
- `SECURITY INVOKER` respects the calling user's RLS policies
- Admin functions legitimately need elevated privileges but are now restricted and audited
- Views inherit RLS policies from underlying tables

---

### Phase 2: Enable RLS on securities_held Table
**Duration:** Immediate  
**Risk:** Low

**Actions:**
1. ✅ Enable RLS on `securities_held` table
2. ✅ Create RLS policies:
   - Authenticated users can view all securities
   - Authenticated users can insert/update/delete securities
   - Service role has full access

**Why This Works:**
- RLS ensures only authenticated users can access data
- Policies align with current application behavior (all authenticated users have access)
- Can be tightened later if needed (e.g., user-specific data)

---

### Phase 3: Comprehensive RLS Review
**Duration:** Immediate  
**Risk:** Medium (requires testing)

**Actions:**
1. ✅ Enable RLS on all main tables if not already enabled
2. ✅ Create default policies for all tables:
   - Authenticated users: Full access (SELECT, INSERT, UPDATE, DELETE)
   - Service role: Full access
   - Anonymous users: No access
3. ✅ Verify all policies are working correctly

**Why This Works:**
- Ensures consistent security posture across all tables
- Default policies maintain current application behavior
- Foundation for future security enhancements

---

### Phase 4: Grant Proper View Permissions
**Duration:** Immediate  
**Risk:** Very Low

**Actions:**
1. ✅ Grant SELECT on all views to `authenticated` and `service_role`
2. ✅ Grant SELECT on `users_public` to `anon` (for login page)
3. ✅ Revoke unnecessary permissions

**Why This Works:**
- Views only show data that underlying tables allow via RLS
- Explicit permissions make security model clear

---

## 🚀 Implementation Steps

### Step 1: Backup Current Database
```sql
-- Run this in Supabase SQL Editor before making changes
-- Download the backup through Supabase dashboard
```

### Step 2: Run Security Remediation Script
```bash
# Execute the fix-security-issues.sql script in Supabase SQL Editor
# File location: scripts/fix-security-issues.sql
```

### Step 3: Verify All Changes
```sql
-- The script includes verification queries at the end
-- Review the output to ensure:
-- 1. All tables have RLS enabled
-- 2. All policies are created
-- 3. Functions are using SECURITY INVOKER (except admin functions)
```

### Step 4: Test Application
```bash
# Test all major workflows:
1. Login as different users
2. Create/edit entities, contacts, etc.
3. Search functionality
4. View relationships
5. Check admin functions (if applicable)
```

---

## 🧪 Testing Checklist

### Pre-Deployment Testing (Development)
- [ ] Run remediation script in development/staging environment
- [ ] Test login with regular user
- [ ] Test login with admin user
- [ ] Test global search functionality
- [ ] Test creating new entities
- [ ] Test editing existing records
- [ ] Test deleting records
- [ ] Test relationship views
- [ ] Test securities_held CRUD operations
- [ ] Verify no console errors
- [ ] Check Supabase logs for errors

### Post-Deployment Testing (Production)
- [ ] Run Supabase linter again to verify all issues resolved
- [ ] Monitor application logs for 24 hours
- [ ] Check user-reported issues
- [ ] Verify no unauthorized access attempts

---

## 📝 Detailed Changes

### Functions Modified

#### 1. `search_all_objects` Function
**Before:**
```sql
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**After:**
```sql
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

**Impact:** Function now respects calling user's RLS policies
**Risk:** None - authenticated users already have access to all search data

---

#### 2. `create_admin_user` Function
**Before:**
```sql
SECURITY DEFINER
AS $$
BEGIN
  -- No audit logging
  -- No search path protection
END;
$$;
GRANT EXECUTE TO service_role;
```

**After:**
```sql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Added audit logging
  INSERT INTO app_logs (level, source, action, message, details)
  VALUES ('INFO', 'create_admin_user', 'user_creation', ...);
END;
$$;
REVOKE ALL FROM PUBLIC;
GRANT EXECUTE TO service_role;
```

**Impact:** Function still has elevated privileges but with better security
**Risk:** Very Low - only service_role can execute, all actions are logged

---

#### 3. `update_admin_password` Function
**Before:**
```sql
SECURITY DEFINER
AS $$
BEGIN
  -- No audit logging
  -- No search path protection
END;
$$;
GRANT EXECUTE TO service_role;
```

**After:**
```sql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Added audit logging
  INSERT INTO app_logs (level, source, action, message, details)
  VALUES ('INFO', 'update_admin_password', 'password_update', ...);
END;
$$;
REVOKE ALL FROM PUBLIC;
GRANT EXECUTE TO service_role;
```

**Impact:** Function still has elevated privileges but with better security
**Risk:** Very Low - only service_role can execute, all actions are logged

---

### Tables Modified

#### `securities_held`
**Before:**
- RLS: Disabled ❌
- Policies: None

**After:**
- RLS: Enabled ✅
- Policies:
  - `Authenticated users can view securities` (SELECT)
  - `Authenticated users can insert securities` (INSERT)
  - `Authenticated users can update securities` (UPDATE)
  - `Authenticated users can delete securities` (DELETE)
  - `Service role has full access` (ALL)

**Impact:** Table now protected by RLS
**Risk:** Very Low - policies match current access patterns

---

### All Other Tables
**RLS Status:**
- ✅ `entities` - RLS enabled
- ✅ `contacts` - RLS enabled
- ✅ `emails` - RLS enabled
- ✅ `phones` - RLS enabled
- ✅ `websites` - RLS enabled
- ✅ `bank_accounts` - RLS enabled
- ✅ `investment_accounts` - RLS enabled
- ✅ `crypto_accounts` - RLS enabled
- ✅ `credit_cards` - RLS enabled
- ✅ `hosting_accounts` - RLS enabled
- ✅ `entity_related_data` - RLS enabled
- ✅ `entity_relationships` - RLS enabled
- ✅ `app_logs` - RLS enabled
- ✅ `users` - RLS enabled

---

## 🔍 Verification Queries

### Check RLS Status
```sql
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check All Policies
```sql
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Function Security
```sql
SELECT 
    proname as function_name,
    CASE WHEN prosecdef THEN 'DEFINER' ELSE 'INVOKER' END as security_type
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('search_all_objects', 'create_admin_user', 'update_admin_password');
```

---

## 🎓 Best Practices Applied

1. **Defense in Depth**
   - Multiple layers of security (RLS + policies + function restrictions)
   
2. **Principle of Least Privilege**
   - Functions only have necessary permissions
   - Admin functions restricted to service_role

3. **Audit Logging**
   - All admin operations logged to `app_logs`
   - Enables security monitoring and compliance

4. **Search Path Protection**
   - `SET search_path = public` prevents injection attacks
   - Ensures functions use correct schema

5. **Explicit Permissions**
   - All grants/revokes are explicit
   - No reliance on default permissions

---

## 🚨 Rollback Plan

If issues arise after deployment:

### Quick Rollback (Emergency)
```sql
-- Disable RLS on securities_held if it causes issues
ALTER TABLE securities_held DISABLE ROW LEVEL SECURITY;
```

### Full Rollback
```sql
-- Restore from database backup taken in Step 1
-- Use Supabase dashboard: Database > Backups > Restore
```

---

## 📊 Success Criteria

✅ **Security Issues Resolved:**
- All 6 SECURITY DEFINER warnings resolved or mitigated
- RLS enabled on securities_held table
- Supabase linter shows 0 ERROR-level security issues

✅ **Functional Testing:**
- All application features work as expected
- No regression in user experience
- No performance degradation

✅ **Security Monitoring:**
- Admin actions logged in `app_logs`
- No unauthorized access attempts
- RLS policies working correctly

---

## 📞 Support

If you encounter any issues during remediation:

1. **Check Logs:** Review `app_logs` table for errors
2. **Supabase Dashboard:** Check real-time logs in Supabase
3. **Rollback:** Use rollback plan if critical issues arise
4. **Review Policies:** Ensure all policies are correctly configured

---

## 📅 Maintenance

### Ongoing Tasks
- [ ] Review RLS policies quarterly
- [ ] Audit `app_logs` for admin actions monthly
- [ ] Run Supabase linter monthly
- [ ] Update policies as application evolves

### Future Enhancements
- [ ] Consider user-specific data policies (e.g., users can only see their own data)
- [ ] Add role-based policies (e.g., managers can see team data)
- [ ] Implement data classification (public, internal, confidential)
- [ ] Add encryption for sensitive fields

---

## ✅ Approval Checklist

Before running in production:

- [ ] Reviewed all changes in `fix-security-issues.sql`
- [ ] Tested in development/staging environment
- [ ] Database backup created
- [ ] All stakeholders notified
- [ ] Rollback plan reviewed
- [ ] Monitoring tools ready
- [ ] Testing checklist completed

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-13  
**Status:** Ready for Implementation

