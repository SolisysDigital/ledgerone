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
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">{config.label}</h1>
          </div>
          <p className="text-sm text-slate-600">
            Manage your {config.label.toLowerCase()} records
          </p>
        </div>
        <Button asChild className="shadow-sm hover:shadow-md transition-shadow bg-blue-600 hover:bg-blue-700">
          <Link href={`/${table}/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <Input 
                placeholder="Search records..." 
                className="w-full bg-white/80 border-slate-200 focus:border-blue-500"
              />
            </div>
            <Button variant="secondary" className="shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Table */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Records ({data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Database className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No {config.label.toLowerCase()} found</h3>
              <p className="text-slate-600 text-center mb-6 max-w-md">
                Get started by creating your first {config.label.toLowerCase()} record.
              </p>
              <Button asChild className="shadow-sm hover:shadow-md transition-shadow bg-blue-600 hover:bg-blue-700">
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
                      <TableHead key={col.name} className="font-semibold text-xs uppercase tracking-wider bg-slate-100 text-slate-700">
                        {col.name === 'name' ? 'Name' : col.name.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-xs uppercase tracking-wider bg-slate-100 text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((row: any, index: number) => (
                    <TableRow 
                      key={row.id} 
                      className={`hover:bg-slate-50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      {columns.slice(0, 5).map((col) => (
                        <TableCell key={col.name} className="py-4">
                          {col.name === 'name' ? (
                            <div title={`ID: ${row.id}`} className="cursor-help font-medium text-slate-800">
                              {row[col.name] || '-'}
                            </div>
                          ) : col.type === "select" ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">{row[col.name]}</Badge>
                          ) : col.type === "fk" ? (
                            <span className="font-medium text-slate-800">{row[col.name]}</span>
                          ) : col.type === "date" ? (
                            <span className="font-medium text-slate-800">
                              {row[col.name] ? new Date(row[col.name]).toLocaleDateString() : '-'}
                            </span>
                          ) : col.type === "number" ? (
                            <span className="font-medium text-slate-800">{row[col.name]?.toLocaleString() || '-'}</span>
                          ) : (
                            <span className="font-medium text-slate-800">{row[col.name] || '-'}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="py-4">
                        <div className="flex space-x-2">
                          <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow border-slate-200 hover:border-blue-300">
                            <Link href={`/${table}/${row.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow border-slate-200 hover:border-blue-300">
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

