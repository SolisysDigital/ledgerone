import React from "react";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";

export default async function HomePage() {
  const table = "entities";
  const config = tableConfigs[table as keyof typeof tableConfigs];
  
  if (!config) return <div>Table not found</div>;

  let select = "*";
  config.fields.forEach((field) => {
    if (field.type === "fk") {
      select += `, ${field.refTable}!${field.name}(${field.displayField} as ${field.name}_display)`;
    }
  });

  const { data, error } = await supabase.from(table).select(select);

  if (error) return <div>Error: {error.message}</div>;

  const columns = [{ name: "id", label: "ID", type: "text" as const }, ...config.fields];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Entities</h1>
          <p className="text-muted-foreground">
            Manage your entities and their relationships
          </p>
        </div>
        <Button asChild>
          <Link href={`/${table}/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Entity
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Entities ({data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No entities found</p>
              <Button asChild>
                <Link href={`/${table}/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Entity
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.slice(0, 6).map((col) => (
                    <TableHead key={col.name}>
                      {'label' in col ? col.label : col.name}
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((row: any) => (
                  <TableRow key={row.id}>
                    {columns.slice(0, 6).map((col) => (
                      <TableCell key={col.name}>
                        {col.type === "select" ? (
                          <Badge variant="secondary">{row[col.name]}</Badge>
                        ) : col.type === "fk" ? (
                          row[`${col.name}_display`] || row[col.name]
                        ) : col.type === "date" ? (
                          row[col.name] ? new Date(row[col.name]).toLocaleDateString() : '-'
                        ) : col.type === "number" ? (
                          row[col.name]?.toLocaleString() || '-'
                        ) : (
                          row[col.name] || '-'
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/${table}/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/${table}/${row.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteButton table={table} id={row.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
