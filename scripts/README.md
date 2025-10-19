# 📁 LedgerOne Scripts Directory

This directory contains the master database schema and utility scripts for the LedgerOne application.

---

## 📄 Main File

### `database-schema.sql`
**The complete database definition for LedgerOne**

This is the single source of truth for your database structure. Run this script to:
- Create all tables
- Set up indexes
- Configure Row Level Security (RLS)
- Create all functions
- Set up triggers
- Create all views
- Insert initial admin user

**To run:**
1. Go to your Supabase Dashboard
2. Open SQL Editor
3. Copy the contents of `database-schema.sql`
4. Paste and execute

**What it includes:**
- ✅ 15 core tables (users, entities, contacts, etc.)
- ✅ All indexes (including full-text search)
- ✅ Complete RLS policies  
- ✅ 9 database functions (with `SET search_path = public`)
- ✅ All triggers
- ✅ 6 views (with `security_invoker=true`)
- ✅ Initial admin user setup

---

## 🛠️ Utility Scripts

### JavaScript Utilities

#### `generate-bcrypt-hash.js`
Generate bcrypt password hashes for user accounts.

```bash
node scripts/generate-bcrypt-hash.js
```

#### `create-admin-user.js`
Create a new admin user via command line.

```bash
node scripts/create-admin-user.js
```

#### `update-admin-password.js`
Update an existing admin user's password.

```bash
node scripts/update-admin-password.js
```

#### `check-database-coverage.js`
Check which tables have proper coverage in your codebase.

```bash
node scripts/check-database-coverage.js
```

---

## 📋 Database Schema Overview

### Core Tables

| Table | Description | Key Features |
|-------|-------------|--------------|
| `users` | Application users | RLS enabled, role-based access |
| `user_permissions` | Granular permissions | Table-level permissions |
| `entities` | Main business entities | Full-text search enabled |
| `contacts` | Individual contacts | Relationships supported |
| `emails` | Email addresses | Primary email flag |
| `phones` | Phone numbers | Primary phone flag |
| `websites` | Website URLs | - |
| `bank_accounts` | Bank account info | Encrypted account numbers |
| `investment_accounts` | Investment accounts | Securities tracking |
| `crypto_accounts` | Crypto wallets | Wallet addresses |
| `credit_cards` | Credit card info | Masked card numbers |
| `hosting_accounts` | Hosting services | - |
| `securities_held` | Investment holdings | Links to investment accounts |
| `entity_related_data` | Relationships | MANY-MANY junction table |
| `app_logs` | Application logs | Error tracking & debugging |

### Security Features

✅ **Row Level Security (RLS)** - Enabled on all tables  
✅ **Search Path Protection** - All functions use `SET search_path = public`  
✅ **Security Invoker Views** - Views respect caller's permissions  
✅ **Admin-only Functions** - Restricted to `service_role`  
✅ **Audit Logging** - All admin actions logged  

### Search & Performance

✅ **Full-Text Search** - GIN indexes on all searchable fields  
✅ **Unified Search View** - Search across all tables at once  
✅ **Optimized Indexes** - Performance-tuned for common queries  
✅ **Relationship Views** - Pre-joined views for complex queries  

---

## 🔐 Security Compliance

This schema follows all Supabase security best practices:

- ✅ No `SECURITY DEFINER` views (all use `security_invoker=true`)
- ✅ All functions have `SET search_path = public`
- ✅ RLS enabled on all public tables
- ✅ Proper permission grants
- ✅ Admin functions restricted to service_role

**Supabase Linter**: This schema passes all security checks! ✨

---

## 🚀 Quick Start

### 1. Fresh Installation

```bash
# 1. Run the master schema
# Copy scripts/database-schema.sql into Supabase SQL Editor and execute

# 2. Update admin password
node scripts/update-admin-password.js
```

### 2. Update Existing Database

The `database-schema.sql` uses `CREATE TABLE IF NOT EXISTS` and `CREATE OR REPLACE` statements, so it's safe to run on an existing database. It will:
- Create missing tables
- Update existing functions
- Recreate views
- Leave existing data intact

---

## 📖 Function Reference

### User Management

- `check_user_permission(user_id, table_name, permission)` - Check if user has permission
- `create_admin_user(username, password_hash, full_name)` - Create admin user
- `update_admin_password(username, new_password_hash)` - Update admin password

### Relationships

- `create_entity_relationship(entity_id, related_data_id, type, description)` - Create relationship
- `get_entity_relationships(entity_id)` - Get all relationships for an entity
- `update_entity_related_data_updated_at()` - Trigger function for timestamps

### Logging

- `insert_app_log(level, source, action, message, ...)` - Insert log entry
- `log_app_event(level, source, action, message, ...)` - Alias for insert_app_log

### Search

- `search_all_objects(search_term, page_num, page_size)` - Search across all tables

---

## 🔄 Migration Notes

### From Previous Versions

If you're migrating from an older version of the database:

1. **Backup your data first!**
   ```bash
   # In Supabase: Database → Backups → Create Backup
   ```

2. **Run the master schema**
   - Existing tables won't be modified
   - Functions will be updated
   - Views will be recreated
   - New tables will be added

3. **Verify everything works**
   - Check your application
   - Run queries
   - Test permissions

### Breaking Changes

**None!** This schema is designed to be backwards compatible.

---

## 📞 Support

If you encounter any issues:

1. Check the verification queries at the end of `database-schema.sql`
2. Review the Supabase logs
3. Check for any constraint violations
4. Verify RLS policies match your needs

---

## 🎯 Best Practices

### When Modifying the Schema

1. **Always update `database-schema.sql`** - Keep it as the single source of truth
2. **Use migrations for data changes** - Schema changes go in the master file
3. **Test in development first** - Never run untested SQL in production
4. **Backup before major changes** - Better safe than sorry
5. **Document your changes** - Add comments in the SQL file

### Security Guidelines

- Never store plain-text passwords
- Always use `SET search_path = public` in functions
- Keep RLS enabled on all tables
- Restrict admin functions to `service_role`
- Log all admin operations

---

## 📊 Schema Statistics

- **15 Tables** - Core data structure
- **50+ Indexes** - Optimized for performance  
- **15 RLS Policies** - Comprehensive security
- **9 Functions** - Business logic
- **5 Triggers** - Automated tasks
- **6 Views** - Simplified queries

---

## 🔗 Related Documentation

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)

---

**Version:** 2.0  
**Last Updated:** 2025-10-19  
**Maintainer:** LedgerOne Team  

---
