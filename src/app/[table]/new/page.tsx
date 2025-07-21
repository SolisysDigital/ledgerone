import React from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateForm from "./CreateForm";

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

  if (!config) return <div>Table not found</div>;

  // Get entity name if this is a child table with a foreign key
  let entityName = "";
  if (resolvedSearchParams.fk && resolvedSearchParams.fkField) {
    // Find the parent table from the foreign key field
    const fkField = config.fields.find(field => field.name === resolvedSearchParams.fkField);
    if (fkField && fkField.type === 'fk' && fkField.refTable) {
      const { data: entityData } = await supabase
        .from(fkField.refTable)
        .select('name')
        .eq('id', resolvedSearchParams.fk)
        .single();
      
      if (entityData) {
        entityName = entityData.name;
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {entityName ? (
            <div className="flex items-center space-x-2">
              <span>Create {config.label} for</span>
              <Badge variant="default" className="text-sm font-semibold bg-primary/10 text-primary border-primary/20">
                {entityName}
              </Badge>
            </div>
          ) : (
            `Create ${config.label}`
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
  );
}