import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Eye, Edit, Search, Database, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import DeleteButton from "@/components/DeleteButton";

export default async function ListPage({ params }: { params: Promise<{ table: string }> }) {
  const resolvedParams = await params;
  const table = resolvedParams.table;
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return <div>Table not found</div>;

  const { data, error } = await supabase.from(table).select("*");

  if (error) return <div>Error: {error.message}</div>;

  const columns = config.fields;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-border/50">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{config.label}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your {config.label.toLowerCase()} records
          </p>
        </div>
        <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
          <Link href={`/${table}/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <Input 
                placeholder="Search records..." 
                className="w-full"
              />
            </div>
            <Button variant="secondary" className="shadow-sm hover:shadow-md transition-shadow flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Table */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Records ({data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                <Database className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No {config.label.toLowerCase()} found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Get started by creating your first {config.label.toLowerCase()} record.
              </p>
              <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/${table}/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First {config.label}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg">
              <Table className="table-modern">
                <TableHeader>
                  <TableRow>
                    {columns.slice(0, 5).map((col) => (
                      <TableHead key={col.name} className="font-semibold text-xs uppercase tracking-wider">
                        {col.name === 'name' ? 'Name' : col.name.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((row: any) => (
                    <TableRow key={row.id} className="hover:bg-muted/30 transition-colors duration-150">
                      {columns.slice(0, 5).map((col) => (
                        <TableCell key={col.name} className="py-4">
                          {col.name === 'name' ? (
                            <div title={`ID: ${row.id}`} className="cursor-help font-medium">
                              {row[col.name] || '-'}
                            </div>
                          ) : col.type === "select" ? (
                            <Badge variant="secondary" className="bg-secondary/50">{row[col.name]}</Badge>
                          ) : col.type === "fk" ? (
                            <span className="font-medium">{row[col.name]}</span>
                          ) : col.type === "date" ? (
                            <span className="font-medium">
                              {row[col.name] ? new Date(row[col.name]).toLocaleDateString() : '-'}
                            </span>
                          ) : col.type === "number" ? (
                            <span className="font-medium">{row[col.name]?.toLocaleString() || '-'}</span>
                          ) : (
                            <span className="font-medium">{row[col.name] || '-'}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="py-4">
                        <div className="flex space-x-2">
                          <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                            <Link href={`/${table}/${row.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

