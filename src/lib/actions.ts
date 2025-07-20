"use server";

import { supabase } from "./supabase";
import { redirect } from "next/navigation";

export async function createItem(table: string, data: Record<string, string>) {
  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
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