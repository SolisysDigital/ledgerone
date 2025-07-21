import { supabase } from "./supabase";
import { tableConfigs } from "./tableConfigs";

export async function fetchRelatedData(table: string, id: string) {
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return {};

  const relatedData: Record<string, any[]> = {};

  // Fetch parent data
  if (config.parent) {
    const { data: parentData, error: parentError } = await supabase
      .from(config.parent.table)
      .select("*")
      .eq(config.parent.fk, id);

    if (!parentError && parentData) {
      relatedData[config.parent.table] = parentData;
    }
  }

  // Fetch children data
  if (config.children) {
    for (const child of config.children) {
      const { data: childData, error: childError } = await supabase
        .from(child.table)
        .select("*")
        .eq(child.fk, id);

      if (!childError && childData) {
        relatedData[child.table] = childData;
      }
      
      // Debug logging for specific tables
      if (child.table === 'contacts' || child.table === 'emails' || child.table === 'phones' || child.table === 'bank_accounts') {
        console.log(`${child.table} query:`, { table: child.table, fk: child.fk, id, data: childData, error: childError });
      }
    }
  }

  return relatedData;
}

export async function fetchRelatedDataWithJoins(table: string, id: string) {
  // Use the simpler version to avoid join syntax issues
  return fetchRelatedData(table, id);
} 