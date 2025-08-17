import { describe, it, expect } from 'vitest';
import { creditCardDisplayFields, creditCardFormFields } from '../credit-card.fields';
import { hostingAccountDisplayFields, hostingAccountFormFields } from '../hosting-account.fields';
import { cryptoAccountDisplayFields, cryptoAccountFormFields } from '../crypto-account.fields';
import { investmentAccountDisplayFields, investmentAccountFormFields } from '../investment-account.fields';
import { bankAccountDisplayFields, bankAccountFormFields } from '../bank-account.fields';

describe('Entity Field Parity Tests', () => {
  describe('Credit Cards', () => {
    it('should have matching display and form fields', () => {
      const displaySet = new Set(creditCardDisplayFields);
      const formSet = new Set(creditCardFormFields);
      
      expect(displaySet).toEqual(formSet);
    });

    it('should include short_description in both arrays', () => {
      expect(creditCardDisplayFields).toContain('short_description');
      expect(creditCardFormFields).toContain('short_description');
    });

    it('should include all required fields', () => {
      const requiredFields = [
        'cardholder_name', 'card_number', 'issuer', 'type', 
        'institution_held_at', 'purpose', 'last_balance', 
        'short_description', 'description'
      ];
      
      requiredFields.forEach(field => {
        expect(creditCardDisplayFields).toContain(field);
        expect(creditCardFormFields).toContain(field);
      });
    });
  });

  describe('Hosting Accounts', () => {
    it('should have matching display and form fields', () => {
      const displaySet = new Set(hostingAccountDisplayFields);
      const formSet = new Set(hostingAccountFormFields);
      
      expect(displaySet).toEqual(formSet);
    });

    it('should include short_description in both arrays', () => {
      expect(hostingAccountDisplayFields).toContain('short_description');
      expect(hostingAccountFormFields).toContain('short_description');
    });

    it('should include all required fields', () => {
      const requiredFields = [
        'provider', 'login_url', 'username', 'password', 
        'short_description', 'description'
      ];
      
      requiredFields.forEach(field => {
        expect(hostingAccountDisplayFields).toContain(field);
        expect(hostingAccountFormFields).toContain(field);
      });
    });
  });

  describe('Crypto Accounts', () => {
    it('should have matching display and form fields', () => {
      const displaySet = new Set(cryptoAccountDisplayFields);
      const formSet = new Set(cryptoAccountFormFields);
      
      expect(displaySet).toEqual(formSet);
    });

    it('should include short_description in both arrays', () => {
      expect(cryptoAccountDisplayFields).toContain('short_description');
      expect(cryptoAccountFormFields).toContain('short_description');
    });

    it('should include all required fields', () => {
      const requiredFields = [
        'platform', 'account_number', 'wallet_address', 
        'institution_held_at', 'purpose', 'last_balance', 
        'short_description', 'description'
      ];
      
      requiredFields.forEach(field => {
        expect(cryptoAccountDisplayFields).toContain(field);
        expect(cryptoAccountFormFields).toContain(field);
      });
    });
  });

  describe('Investment Accounts', () => {
    it('should have matching display and form fields', () => {
      const displaySet = new Set(investmentAccountDisplayFields);
      const formSet = new Set(investmentAccountFormFields);
      
      expect(displaySet).toEqual(formSet);
    });

    it('should include short_description in both arrays', () => {
      expect(investmentAccountDisplayFields).toContain('short_description');
      expect(investmentAccountFormFields).toContain('short_description');
    });

    it('should include all required fields', () => {
      const requiredFields = [
        'provider', 'account_type', 'account_number', 
        'institution_held_at', 'purpose', 'last_balance', 
        'short_description', 'description'
      ];
      
      requiredFields.forEach(field => {
        expect(investmentAccountDisplayFields).toContain(field);
        expect(investmentAccountFormFields).toContain(field);
      });
    });
  });

  describe('Bank Accounts', () => {
    it('should have matching display and form fields', () => {
      const displaySet = new Set(bankAccountDisplayFields);
      const formSet = new Set(bankAccountFormFields);
      
      expect(displaySet).toEqual(formSet);
    });

    it('should include short_description in both arrays', () => {
      expect(bankAccountDisplayFields).toContain('short_description');
      expect(bankAccountFormFields).toContain('short_description');
    });

    it('should include all required fields', () => {
      const requiredFields = [
        'bank_name', 'account_number', 'routing_number', 
        'institution_held_at', 'purpose', 'last_balance', 
        'short_description', 'description'
      ];
      
      requiredFields.forEach(field => {
        expect(bankAccountDisplayFields).toContain(field);
        expect(bankAccountFormFields).toContain(field);
      });
    });
  });

  describe('Cross-Entity Consistency', () => {
    it('should have consistent field naming across all entities', () => {
      const allEntities = [
        { name: 'Credit Cards', fields: creditCardDisplayFields },
        { name: 'Hosting Accounts', fields: hostingAccountDisplayFields },
        { name: 'Crypto Accounts', fields: cryptoAccountDisplayFields },
        { name: 'Investment Accounts', fields: investmentAccountDisplayFields },
        { name: 'Bank Accounts', fields: bankAccountDisplayFields },
      ];

      // Check that common fields use consistent naming
      allEntities.forEach(entity => {
        if (entity.fields.includes('short_description')) {
          expect(entity.fields).toContain('short_description');
        }
        if (entity.fields.includes('description')) {
          expect(entity.fields).toContain('description');
        }
      });
    });
  });
});
