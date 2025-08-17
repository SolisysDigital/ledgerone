# Field Parity Guardrails System

## Overview

The Field Parity Guardrails System is a comprehensive testing and validation framework designed to prevent field omissions between Details and Edit pages. This system ensures that all entity types maintain consistent field coverage and prevents the issues that were previously experienced with missing `short_description` fields.

## 🎯 What This System Prevents

- **Field Omissions**: Ensures that fields added to Edit forms are also displayed on Details pages
- **Inconsistent Rendering**: Guarantees that display and form fields are always in sync
- **Critical Field Missing**: Prevents essential fields like `short_description` from being overlooked
- **Database Schema Drift**: Ensures entity field specifications match expected database columns

## 🏗️ Architecture

### 1. Entity Field Specifications

Each entity type has a dedicated field specification file in `src/lib/entities/`:

```typescript
// Example: credit-card.fields.ts
export const creditCardDisplayFields: Array<keyof CreditCard> = [
  'cardholder_name', 'card_number', 'issuer', 'type',
  'institution_held_at', 'purpose', 'last_balance',
  'short_description', 'description'  // ← Ensured to be present
];

export const creditCardFormFields: Array<keyof CreditCard> = [
  'cardholder_name', 'card_number', 'issuer', 'type',
  'institution_held_at', 'purpose', 'last_balance',
  'short_description', 'description'  // ← Matches display fields exactly
];
```

### 2. Standardized Components

- **`RecordHeader`**: Ensures consistent teal chip display across all pages
- **`DetailsGrid`**: Renders fields based on `displayFields` array
- **`FormGrid`**: Renders form inputs based on `formFields` array

### 3. Automated Testing

- **Field Parity Tests**: Verify that display and form fields match exactly
- **Critical Field Tests**: Ensure essential fields like `short_description` are present
- **Database Coverage Tests**: Validate that all database columns are covered

## 🚀 Usage

### Running Tests Locally

```bash
# Check field parity and database coverage
npm run test:coverage

# Run specific field parity check
npm run test:field-parity

# This will run automatically before builds
npm run build
```

### Adding New Entities

1. **Create Field Specification File**:
   ```typescript
   // src/lib/entities/new-entity.fields.ts
   export const newEntityDisplayFields = [
     'name', 'description', 'short_description'  // ← Include all fields
   ];
   
   export const newEntityFormFields = [
     'name', 'description', 'short_description'  // ← Must match exactly
   ];
   ```

2. **Update Expected Schema** in `scripts/check-database-coverage.js`:
   ```javascript
   const expectedSchema = {
     // ... existing schemas
     new_entity: [
       'id', 'name', 'description', 'short_description',
       'created_at', 'updated_at', 'user_id'
     ]
   };
   ```

3. **Create Entity Pages** using the standardized components:
   ```typescript
   import { DetailsGrid } from "@/components/record/DetailsGrid";
   import { newEntityDisplayFields } from "@/lib/entities/new-entity.fields";
   
   <DetailsGrid
     data={entityData}
     displayFields={newEntityDisplayFields}
     fieldLabels={fieldLabels}
   />
   ```

## 🔍 Testing Framework

### Field Parity Tests

Tests ensure that:
- Display and form fields have identical content
- Field counts match between arrays
- All required fields are present

### Database Coverage Tests

Tests validate that:
- All expected database columns are covered
- Critical fields like `short_description` are present
- Field specifications match database schema

### CI/CD Integration

The system integrates with GitHub Actions to:
- Run automatically on every PR and push
- Fail builds if field parity is broken
- Provide detailed feedback on what needs to be fixed

## 🛡️ Guardrail Rules

### 1. Field Consistency Rule
> **Display fields and form fields must always be identical**

```typescript
// ✅ CORRECT - Fields match exactly
export const displayFields = ['name', 'description', 'short_description'];
export const formFields = ['name', 'description', 'short_description'];

// ❌ INCORRECT - Fields don't match
export const displayFields = ['name', 'description', 'short_description'];
export const formFields = ['name', 'description']; // Missing short_description
```

### 2. Critical Field Rule
> **Essential fields like `short_description` must be present in both arrays**

```typescript
// ✅ CORRECT - Critical field present
export const displayFields = ['name', 'short_description', 'description'];

// ❌ INCORRECT - Critical field missing
export const displayFields = ['name', 'description']; // Missing short_description
```

### 3. Database Coverage Rule
> **All database columns must be represented in field specifications**

```typescript
// ✅ CORRECT - All database fields covered
export const displayFields = [
  'name', 'description', 'short_description', 'created_at'
];

// ❌ INCORRECT - Missing database fields
export const displayFields = ['name', 'description']; // Missing short_description, created_at
```

## 📋 Troubleshooting

### Common Issues

1. **Field Parity Check Failed**
   - Ensure `displayFields` and `formFields` arrays are identical
   - Check for typos or missing fields in either array

2. **Critical Field Missing**
   - Add `short_description` to both `displayFields` and `formFields`
   - Verify the field name spelling matches exactly

3. **Database Coverage Failed**
   - Update the expected schema in `check-database-coverage.js`
   - Ensure all database columns are represented in field specifications

### Debug Commands

```bash
# Check specific entity
node scripts/check-database-coverage.js

# View detailed output
DEBUG=* node scripts/check-database-coverage.js

# Run with verbose logging
npm run test:coverage -- --verbose
```

## 🔮 Future Enhancements

### Planned Features

1. **Dynamic Schema Validation**: Real-time database schema introspection
2. **Field Type Validation**: Ensure field types match between display and form
3. **Performance Monitoring**: Track field rendering performance across entities
4. **Visual Field Mapper**: Web interface for managing field specifications

### Integration Opportunities

1. **Supabase Schema Sync**: Automatic field specification updates
2. **TypeScript Strict Mode**: Enhanced type safety for field arrays
3. **Storybook Integration**: Visual testing of field rendering
4. **E2E Test Generation**: Automatic test creation from field specifications

## 📚 Related Documentation

- [Entity Field Specifications](./entity-field-specifications.md)
- [Standardized Components](./standardized-components.md)
- [Testing Framework](./testing-framework.md)
- [CI/CD Pipeline](./ci-cd-pipeline.md)

## 🤝 Contributing

When contributing to this system:

1. **Always run tests** before submitting changes
2. **Update field specifications** when adding new fields
3. **Maintain field parity** between display and form arrays
4. **Include critical fields** like `short_description`
5. **Update documentation** for any new features

## 📞 Support

If you encounter issues with the Field Parity Guardrails System:

1. Check the troubleshooting section above
2. Run the coverage script to identify specific problems
3. Review the guardrail rules for compliance
4. Consult the testing framework documentation
5. Open an issue with detailed error information

---

**Remember**: The goal is to prevent field omissions, not to restrict development. This system ensures consistency and reliability across all entity types.
