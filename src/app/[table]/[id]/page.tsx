import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { fetchRelatedDataWithJoins } from "@/lib/relationshipUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RelationshipTabs from "@/components/RelationshipTabs";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

export default async function DetailPage({ 
  params 
}: { 
  params: Promise<{ table: string; id: string }> 
}) {
  const resolvedParams = await params;
  const { table, id } = resolvedParams;
  
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return notFound();

  // Build select query with joins
  let select = "*";
  config.fields.forEach((field) => {
    if (field.type === "fk") {
      select += `, ${field.refTable}!${field.name}(${field.displayField} as ${field.name}_display)`;
    }
  });

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  // Fetch related data
  const relatedData = await fetchRelatedDataWithJoins(table, id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${table}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{config.label} Details</h1>
            <p className="text-sm text-muted-foreground">ID: {id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href={`/${table}/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map((field) => {
              const value = (data as any)[field.name];
              const displayValue = field.type === "fk" 
                ? (data as any)[`${field.name}_display`] || value 
                : value;

              return (
                <div key={field.name} className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground capitalize">
                    {field.name.replace(/_/g, ' ')}
                  </label>
                  <div className="text-sm">
                    {field.type === "select" ? (
                      <Badge variant="secondary">{displayValue}</Badge>
                    ) : field.type === "textarea" ? (
                      <p className="whitespace-pre-wrap">{displayValue}</p>
                    ) : field.type === "date" ? (
                      <span>{displayValue ? new Date(displayValue).toLocaleDateString() : '-'}</span>
                    ) : field.type === "number" ? (
                      <span>{displayValue?.toLocaleString() || '-'}</span>
                    ) : (
                      <span>{displayValue || '-'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Relationships */}
      {(config.parent || config.children?.length) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Data</CardTitle>
          </CardHeader>
          <CardContent>
            <RelationshipTabs 
              currentTable={table} 
              currentId={id} 
              relatedData={relatedData} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 