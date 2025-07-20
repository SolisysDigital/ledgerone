import React from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateForm from "./CreateForm";

export default async function CreatePage({ params }: { params: Promise<{ table: string }> }) {
  const resolvedParams = await params;
  const table = resolvedParams.table;
  const config = tableConfigs[table as keyof typeof tableConfigs];

  if (!config) return <div>Table not found</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create {config.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateForm table={table} config={config} />
      </CardContent>
    </Card>
  );
}