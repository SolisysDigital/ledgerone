import React from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateForm from "./CreateForm";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default async function CreatePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ table: string }>;
  searchParams: Promise<{ fk?: string; fkField?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const table = resolvedParams.table;
  const config = tableConfigs[table as keyof typeof tableConfigs];

  if (!config) {
    return (
      <ClientNavigationWrapper>
        <div>Table not found</div>
      </ClientNavigationWrapper>
    );
  }

  // Get entity name if this is a child table with a foreign key
  let entityName = "";
  if (resolvedSearchParams.fk && resolvedSearchParams.fkField) {
    // Find the parent table from the foreign key field
    const fkField = config.fields.find(field => field.name === resolvedSearchParams.fkField);
    if (fkField && fkField.type === 'fk' && fkField.refTable) {
      // Fetch entity data using the working API endpoint instead of direct Supabase
      const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/${fkField.refTable}/${resolvedSearchParams.fk}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const entityData = await response.json();
        if (entityData && typeof entityData.name === 'string') {
          entityName = entityData.name;
        }
      }
    }
  }

  return (
    <ClientNavigationWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Create New {config.label.slice(0, -1)}
            {entityName && (
              <Badge variant="secondary" className="ml-2">
                for {entityName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateForm 
            table={table} 
            config={config} 
            entityName={entityName}
          />
        </CardContent>
      </Card>
    </ClientNavigationWrapper>
  );
}