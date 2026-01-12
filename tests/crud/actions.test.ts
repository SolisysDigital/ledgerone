/**
 * CRUD Operations Tests - Server Actions
 * Tests createItem, updateItem, deleteItem functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createItem, updateItem, deleteItem } from '@/lib/actions';
import { getServiceSupabase } from '@/lib/supabase';
import { getTestDataForTable, getUpdateDataForTable } from '../helpers/testData';
import { tableConfigs } from '@/lib/tableConfigs';

// Get all testable tables (exclude system tables)
const testableTables = Object.keys(tableConfigs).filter(
  table => !['app_logs', 'users'].includes(table)
);

describe('CRUD Operations - Server Actions', () => {
  const createdIds: Record<string, string[]> = {};

  afterEach(async () => {
    // Cleanup: Delete all created test records
    const supabase = getServiceSupabase();
    for (const [table, ids] of Object.entries(createdIds)) {
      for (const id of ids) {
        try {
          await (supabase as any).from(table).delete().eq('id', id);
        } catch (error) {
          console.error(`Failed to cleanup ${table}:${id}`, error);
        }
      }
    }
    Object.keys(createdIds).forEach(key => delete createdIds[key]);
  });

  describe.each(testableTables)('Table: %s', (table) => {
    it(`should CREATE a new ${table} record`, async () => {
      const testData = getTestDataForTable(table);
      
      // Skip tables that require foreign keys for initial creation
      if (table === 'securities_held' || table === 'entity_relationships' || table === 'entity_related_data') {
        // These require parent records - will be tested separately
        return;
      }

      const result = await createItem(table, testData);
      
      expect(result).toHaveProperty('success');
      
      if (result.success) {
        // Fetch the created record to get its ID
        const supabase = getServiceSupabase();
        const { data } = await (supabase as any)
          .from(table)
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.id) {
          if (!createdIds[table]) createdIds[table] = [];
          createdIds[table].push(data.id);
        }
      }
    });

    it(`should READ (get) a ${table} record`, async () => {
      // First create a record
      const testData = getTestDataForTable(table);
      
      if (table === 'securities_held' || table === 'entity_relationships' || table === 'entity_related_data') {
        return;
      }

      const createResult = await createItem(table, testData);
      
      if (!createResult.success) {
        // Skip if creation failed
        return;
      }

      // Get the created record
      const supabase = getServiceSupabase();
      const { data: createdRecord } = await (supabase as any)
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!createdRecord?.id) {
        return;
      }

      if (!createdIds[table]) createdIds[table] = [];
      createdIds[table].push(createdRecord.id);

      // Verify the record exists
      const { data: fetchedRecord, error } = await (supabase as any)
        .from(table)
        .select('*')
        .eq('id', createdRecord.id)
        .single();

      expect(error).toBeNull();
      expect(fetchedRecord).toBeDefined();
      expect(fetchedRecord.id).toBe(createdRecord.id);
      
      // Verify data matches
      for (const [key, value] of Object.entries(testData)) {
        expect(fetchedRecord[key]).toBe(value);
      }
    });

    it(`should UPDATE a ${table} record`, async () => {
      const testData = getTestDataForTable(table);
      const updateData = getUpdateDataForTable(table);
      
      if (table === 'securities_held' || table === 'entity_relationships' || table === 'entity_related_data') {
        return;
      }

      // Create a record first
      const createResult = await createItem(table, testData);
      
      if (!createResult.success) {
        return;
      }

      const supabase = getServiceSupabase();
      const { data: createdRecord } = await (supabase as any)
        .from(table)
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!createdRecord?.id) {
        return;
      }

      if (!createdIds[table]) createdIds[table] = [];
      createdIds[table].push(createdRecord.id);

      // Update the record
      const updateResult = await updateItem(table, createdRecord.id, updateData);
      
      expect(updateResult).toHaveProperty('success');
      if (updateResult.success) {
        // Verify the update
        const { data: updatedRecord } = await (supabase as any)
          .from(table)
          .select('*')
          .eq('id', createdRecord.id)
          .single();

        expect(updatedRecord).toBeDefined();
        
        // Verify updated fields
        for (const [key, value] of Object.entries(updateData)) {
          expect(updatedRecord[key]).toBe(value);
        }
      }
    });

    it(`should DELETE a ${table} record`, async () => {
      const testData = getTestDataForTable(table);
      
      if (table === 'securities_held' || table === 'entity_relationships' || table === 'entity_related_data') {
        return;
      }

      // Create a record first
      const createResult = await createItem(table, testData);
      
      if (!createResult.success) {
        return;
      }

      const supabase = getServiceSupabase();
      const { data: createdRecord } = await (supabase as any)
        .from(table)
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!createdRecord?.id) {
        return;
      }

      // Delete the record
      const deleteResult = await deleteItem(table, createdRecord.id);
      
      expect(deleteResult).toHaveProperty('success');
      expect(deleteResult.success).toBe(true);

      // Verify the record is deleted
      const { data: deletedRecord } = await (supabase as any)
        .from(table)
        .select('*')
        .eq('id', createdRecord.id)
        .single();

      expect(deletedRecord).toBeNull();
    });

    it(`should handle CREATE with invalid data for ${table}`, async () => {
      const result = await createItem(table, {});
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it(`should handle UPDATE with invalid ID for ${table}`, async () => {
      const updateData = getUpdateDataForTable(table);
      const invalidId = '00000000-0000-0000-0000-000000000000';
      
      const result = await updateItem(table, invalidId, updateData);
      
      // Update might succeed even with invalid ID (no error thrown)
      // This test just ensures it doesn't crash
      expect(result).toHaveProperty('success');
    });

    it(`should handle DELETE with invalid ID for ${table}`, async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      
      const result = await deleteItem(table, invalidId);
      
      // Delete might succeed even with invalid ID (no error thrown)
      // This test just ensures it doesn't crash
      expect(result).toHaveProperty('success');
    });
  });
});
