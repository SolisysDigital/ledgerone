import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditForm from "./EditForm";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default async function EditPage({ 
  params 
}: { 
  params: Promise<{ table: string; id: string }> 
}) {
  const resolvedParams = await params;
  const { table, id } = resolvedParams;
  
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return notFound();

  // Fetch existing data
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/${table}/${id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold">Edit {config.label}</h1>
              <p className="text-xs text-muted-foreground">ID: {id}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Update Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm table={table} config={config} initialData={data} />
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
} 