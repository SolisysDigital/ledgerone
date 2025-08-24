"use server";

import { getServiceSupabase } from "./supabase";
import { AppLogger } from "./logger";

export async function createItem(table: string, data: Record<string, string>) {
  console.log('Creating item in table:', table, 'with data:', data);
  
  // Use service role Supabase client to bypass RLS
  const supabase = getServiceSupabase();
  
  // Log the operation start
  await AppLogger.debug('createItem', 'operation_start', `Starting create operation for table: ${table}`, { table, data });
  
  // Ensure we have at least some data
  if (!data || Object.keys(data).length === 0) {
    const error = new Error('No data provided for creation');
    await AppLogger.error('createItem', 'validation', 'No data provided for creation', error, { table });
    return { success: false, error: 'No data provided for creation' };
  }
  
  const { error } = await supabase.from(table).insert(data);
  if (error) {
    console.error('Supabase error:', error);
    await AppLogger.error('createItem', 'database_insert', `Failed to create item in ${table}`, error, { table, data, supabaseError: error });
    return { success: false, error: error.message };
  }
  
  console.log('Item created successfully');
  await AppLogger.info('createItem', 'database_insert', `Successfully created item in ${table}`, { table, data });
  return { success: true, message: 'Item created successfully' };
}

export async function updateItem(table: string, id: string, data: Record<string, string>) {
  console.log('Updating item in table:', table, 'with id:', id, 'and data:', data);
  
  // Use service role Supabase client to bypass RLS
  const supabase = getServiceSupabase();
  
  // Log the operation start
  await AppLogger.debug('updateItem', 'operation_start', `Starting update operation for table: ${table}, id: ${id}`, { table, id, data });
  
  // Ensure we have at least some data
  if (!data || Object.keys(data).length === 0) {
    const error = new Error('No data provided for update');
    await AppLogger.error('updateItem', 'validation', 'No data provided for update', error, { table, id });
    return { success: false, error: 'No data provided for update' };
  }
  
  const { error } = await supabase.from(table).update(data).eq('id', id);
  if (error) {
    console.error('Supabase update error:', error);
    await AppLogger.error('updateItem', 'database_update', `Failed to update item in ${table}`, error, { table, id, data, supabaseError: error });
    return { success: false, error: error.message };
  }
  
  console.log('Item updated successfully');
  await AppLogger.info('updateItem', 'database_update', `Successfully updated item in ${table}`, { table, id, data });
  
  return { success: true, message: 'Item updated successfully' };
}

export async function deleteItem(table: string, id: string) {
  // Use service role Supabase client to bypass RLS
  const supabase = getServiceSupabase();
  
  // Log the operation start
  await AppLogger.debug('deleteItem', 'operation_start', `Starting delete operation for table: ${table}, id: ${id}`, { table, id });
  
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    await AppLogger.error('deleteItem', 'database_delete', `Failed to delete item from ${table}`, error, { table, id, supabaseError: error });
    return { success: false, error: error.message };
  }
  
  await AppLogger.info('deleteItem', 'database_delete', `Successfully deleted item from ${table}`, { table, id });
  return { success: true, message: 'Item deleted successfully' };
} 