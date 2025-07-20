"use server";

import { supabase } from "./supabase";
import { redirect } from "next/navigation";

export async function createItem(table: string, data: any) {
  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
  return redirect(`/${table}`);
} 