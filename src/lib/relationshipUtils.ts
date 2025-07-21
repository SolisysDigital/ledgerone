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
      console.log(`Fetching ${child.table} where ${child.fk} = ${id}`);
      const { data: childData, error: childError } = await supabase
        .from(child.table)
        .select("*")
        .eq(child.fk, id);

      console.log(`Result for ${child.table}:`, { data: childData, error: childError });

      if (!childError && childData) {
        relatedData[child.table] = childData;
      }
    }
  }

  console.log('Final relatedData:', relatedData);
  return relatedData;
}

export async function fetchRelatedDataWithJoins(table: string, id: string) {
  // Use the simpler version to avoid join syntax issues
  return fetchRelatedData(table, id);
} 