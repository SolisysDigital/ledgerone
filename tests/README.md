# CRUD Operations Test Suite

This test suite provides comprehensive CRUD (Create, Read, Update, Delete) operation tests for all objects/tables in the system.

## Overview

The test suite includes:
- **Server Actions Tests**: Tests for `createItem`, `updateItem`, `deleteItem` functions
- **All Objects Coverage**: Tests for all tables defined in `tableConfigs`
- **Test Data Generators**: Helper functions to generate test data for each table
- **Cleanup**: Automatic cleanup of test records after tests

## Tables Tested

The following tables are tested:
- `entities`
- `contacts`
- `emails`
- `phones`
- `bank_accounts`
- `investment_accounts`
- `securities_held` (requires parent record)
- `crypto_accounts`
- `credit_cards`
- `websites`
- `hosting_accounts`
- `entity_relationships` (requires parent records)
- `entity_related_data` (requires parent records)

## Setup

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install --save-dev vitest @vitest/ui dotenv
   ```

2. **Environment Variables**:
   Ensure you have a `.env.local` or `.env` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run tests with UI:
```bash
npm run test:ui
```

### Run specific test file:
```bash
npm test tests/crud/actions.test.ts
```

## Test Structure

```
tests/
├── README.md                    # This file
├── setup.ts                     # Test setup and environment variable loading
├── helpers/
│   ├── testData.ts             # Test data generators for each table
│   └── apiHelpers.ts           # API helper functions (for future API route tests)
└── crud/
    └── actions.test.ts         # CRUD operations tests for server actions
```

## Test Coverage

Each table is tested for:
1. **CREATE**: Creating a new record
2. **READ**: Fetching a record by ID
3. **UPDATE**: Updating a record
4. **DELETE**: Deleting a record
5. **Error Handling**: Invalid data, invalid IDs

## Notes

- Tests use the service role Supabase client to bypass RLS
- Test records are automatically cleaned up after each test
- Tests that require parent records (like `securities_held`) are skipped in basic tests
- Tests are designed to be run against a development database

## Important

⚠️ **Warning**: These tests will create and delete real data in your database. Always run tests against a development/test database, never against production data.

## Adding New Tests

To add tests for a new table:

1. Add test data to `tests/helpers/testData.ts`:
   ```typescript
   newTable: {
     field1: 'test value',
     field2: 'test value',
   }
   ```

2. Add update data to `getUpdateDataForTable`:
   ```typescript
   newTable: {
     field1: 'updated value',
   }
   ```

3. The test suite will automatically test the new table since it uses `tableConfigs` to discover tables.
