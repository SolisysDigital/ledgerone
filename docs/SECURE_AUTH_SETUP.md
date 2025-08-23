# 🔐 Secure Authentication Setup Guide

This guide explains how to set up the new secure authentication system that follows the lead developer's recommendations.

## 🚨 **What Changed (Security Improvements)**

### **Before (Insecure):**
- ❌ Client-side password verification with SHA-256/MD5
- ❌ Reading password_hash from client using anon key
- ❌ Client-side admin user creation
- ❌ No RLS policies on users table

### **After (Secure):**
- ✅ Server-side bcrypt password verification
- ✅ Service role key for sensitive operations
- ✅ HTTP-only session cookies
- ✅ RLS policies protecting password_hash
- ✅ Secure admin user management functions

## 🔧 **Setup Steps**

### **Step 1: Environment Variables**

Add these to your `.env.local` file:
```bash
# Existing (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# NEW: Add this for secure authentication
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Get your service role key from:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the "service_role" key (NOT the anon key)
3. Add it to Vercel environment variables

### **Step 2: Database Security Setup**

Run this SQL in your Supabase SQL Editor (with service role):
```sql
-- Run the secure-users-table.sql script
-- This enables RLS and creates secure policies
```

### **Step 3: Create Admin User**

Use the new secure script:
```bash
node scripts/create-admin-user.js "admin" "YourSecurePassword123!" "System Administrator"
```

### **Step 4: Update Existing Admin Password**

If you need to change an existing admin password:
```bash
node scripts/update-admin-password.js "NewSecurePassword123!"
```

## 🔍 **How It Works Now**

### **Login Flow:**
1. User enters credentials in browser
2. Client calls `/api/auth/login` (POST)
3. Server uses service role key to query users table
4. Server verifies password with bcrypt.compare()
5. Server sets HTTP-only session cookie
6. Client receives user data (no password_hash)

### **Session Verification:**
1. Client calls `/api/auth/verify` (GET)
2. Server reads session cookie
3. Server validates session and returns user data
4. No sensitive data exposed to client

### **Security Features:**
- 🔒 **Password hashes never leave the server**
- 🔒 **Service role key required for sensitive operations**
- 🔒 **RLS policies block direct table access**
- 🔒 **HTTP-only cookies prevent XSS attacks**
- 🔒 **bcrypt with salt rounds for password security**

## 🚫 **What's Blocked Now**

- ❌ Client-side password verification
- ❌ Direct access to users table
- ❌ Reading password_hash from client
- ❌ Client-side admin user creation
- ❌ Using anon key for sensitive operations

## 🧪 **Testing the New System**

1. **Test Login:**
   - Go to `/login`
   - Enter admin credentials
   - Should work with new secure flow

2. **Test Session:**
   - After login, refresh page
   - Should stay logged in
   - Check browser dev tools → Application → Cookies

3. **Test Security:**
   - Try to access `/api/auth/verify` directly
   - Should return 401 without valid session

## 🚨 **Troubleshooting**

### **"Missing required environment variables"**
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify in Vercel environment variables

### **"Invalid credentials"**
- Ensure admin user exists in database
- Check password is correct
- Verify bcrypt hash was generated properly

### **Build errors**
- Ensure all environment variables are set
- Check that RLS policies are applied
- Verify database functions exist

## 📚 **API Reference**

### **POST /api/auth/login**
- **Body:** `{ username, password }`
- **Response:** `{ user }` + session cookie
- **Security:** Uses service role key, bcrypt verification

### **GET /api/auth/verify**
- **Headers:** Includes session cookie
- **Response:** `{ authenticated, user }`
- **Security:** Validates session, returns safe user data

### **POST /api/auth/logout**
- **Headers:** Includes session cookie
- **Response:** `{ success }`
- **Security:** Clears session cookie

## 🔐 **Next Steps for Production**

1. **JWT Implementation:** Replace simple cookies with JWT tokens
2. **Session Rotation:** Implement token refresh mechanism
3. **Rate Limiting:** Add login attempt throttling
4. **Audit Logging:** Track authentication events
5. **Multi-Factor Auth:** Add 2FA support

## 📞 **Support**

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase logs for database errors
4. Ensure RLS policies are applied correctly
