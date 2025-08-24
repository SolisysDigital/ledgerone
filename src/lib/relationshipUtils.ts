import { tableConfigs } from "./tableConfigs";

export async function fetchRelatedData(table: string, id: string) {
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return {};

  const relatedData: Record<string, any[]> = {};

  // Fetch parent data using the working API endpoint
  if (config.parent) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/${config.parent.table}?${config.parent.fk}=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const parentData = await response.json();
        if (parentData && Array.isArray(parentData)) {
          relatedData[config.parent.table] = parentData;
        }
      }
    } catch (error) {
      console.error(`Error fetching parent data for ${table}:`, error);
    }
  }

  // Fetch children data using the working API endpoint
  if (config.children) {
    for (const child of config.children) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/${child.table}?${child.fk}=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const childData = await response.json();
          if (childData && Array.isArray(childData)) {
            relatedData[child.table] = childData;
          }
        }
        
        // Debug logging for specific tables
        if (child.table === 'contacts' || child.table === 'emails' || child.table === 'phones' || child.table === 'bank_accounts') {
          console.log(`${child.table} query:`, { table: child.table, fk: child.fk, id, data: childData, error: null });
        }
      } catch (error) {
        console.error(`Error fetching child data for ${child.table}:`, error);
      }
    }
  }

  return relatedData;
}

export async function fetchRelatedDataWithJoins(table: string, id: string) {
  // Use the simpler version to avoid join syntax issues
  return fetchRelatedData(table, id);
} 