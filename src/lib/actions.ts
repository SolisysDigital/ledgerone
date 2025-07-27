"use server";

import { supabase } from "./supabase";
import { redirect } from "next/navigation";

export async function createItem(table: string, data: Record<string, string>) {
  console.log('Creating item in table:', table, 'with data:', data);
  
  // Ensure we have at least some data
  if (!data || Object.keys(data).length === 0) {
    throw new Error('No data provided for creation');
  }
  
  const { error } = await supabase.from(table).insert(data);
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  console.log('Item created successfully');
  return redirect(`/${table}`);
}

export async function updateItem(table: string, id: string, data: Record<string, string>) {
  const { error } = await supabase.from(table).update(data).eq('id', id);
  if (error) throw error;
  return redirect(`/${table}/${id}`);
}

export async function deleteItem(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return redirect(`/${table}`);
} 