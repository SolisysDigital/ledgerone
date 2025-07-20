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
    }
  }

  return relatedData;
}

export async function fetchRelatedDataWithJoins(table: string, id: string) {
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return {};

  const relatedData: Record<string, any[]> = {};

  // Fetch parent data with joins
  if (config.parent) {
    let select = "*";
    const parentConfig = tableConfigs[config.parent.table as keyof typeof tableConfigs];
    if (parentConfig) {
      parentConfig.fields.forEach((field) => {
        if (field.type === "fk") {
          select += `, ${field.refTable}!${field.name}(${field.displayField} as ${field.name}_display)`;
        }
      });
    }

    const { data: parentData, error: parentError } = await supabase
      .from(config.parent.table)
      .select(select)
      .eq(config.parent.fk, id);

    if (!parentError && parentData) {
      relatedData[config.parent.table] = parentData;
    }
  }

  // Fetch children data with joins
  if (config.children) {
    for (const child of config.children) {
      let select = "*";
      const childConfig = tableConfigs[child.table as keyof typeof tableConfigs];
      if (childConfig) {
        childConfig.fields.forEach((field) => {
          if (field.type === "fk") {
            select += `, ${field.refTable}!${field.name}(${field.displayField} as ${field.name}_display)`;
          }
        });
      }

      const { data: childData, error: childError } = await supabase
        .from(child.table)
        .select(select)
        .eq(child.fk, id);

      if (!childError && childData) {
        relatedData[child.table] = childData;
      }
    }
  }

  return relatedData;
} 