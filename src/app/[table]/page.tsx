"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  Filter, 
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { tableConfigs } from "@/lib/tableConfigs";
import DeleteButton from "@/components/DeleteButton";

interface Record {
  id: string;
  [key: string]: any;
}

interface TablePageProps {
  params: Promise<{
    table: string;
  }>;
}

export default function TablePage({ params }: TablePageProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [tableName, setTableName] = useState<string>("");
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const table = resolvedParams.table;
      const tableConfig = tableConfigs[table as keyof typeof tableConfigs];
      
      setTableName(table);
      setConfig(tableConfig);
    };
    
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (config && tableName) {
      fetchRecords();
    }
  }, [tableName, currentPage, searchQuery, config]);

  const fetchRecords = async () => {
    if (!config || !tableName) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchQuery,
      });

      const response = await fetch(`/api/${tableName}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.totalRecords || 0);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayValue = (record: Record, fieldName: string) => {
    const value = record[fieldName];
    if (value === null || value === undefined) return "-";
    return String(value);
  };

  const getPrimaryField = () => {
    if (!config) return 'id';
    
    // Try to find a good display field
    const displayFields = ['name', 'title', 'email', 'phone', 'url', 'bank_name', 'provider', 'platform', 'cardholder_name'];
    for (const field of displayFields) {
      if (config.fields.some((f: any) => f.name === field)) {
        return field;
      }
    }
    return config.fields[0]?.name || 'id';
  };

  if (!config) {
    return <div className="p-6">Table not found</div>;
  }

  const primaryField = getPrimaryField();

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            {config.label}
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your {config.label.toLowerCase()} data
          </p>
        </div>
        
        <Button asChild className="btn-animate hover-glow">
          <Link href={`/${tableName}/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add New {config.label.slice(0, -1)}
          </Link>
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-orange-600" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder={`Search ${config.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-animate focus-ring"
              />
            </div>
            <Button variant="outline" className="btn-animate">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Section */}
      <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              Records ({totalRecords})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              <span className="ml-2 text-slate-600">Loading records...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">No records found</div>
              <Button asChild className="btn-animate">
                <Link href={`/${tableName}/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Record
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-500">
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-white">
                        {config.fields.find((f: any) => f.name === primaryField)?.label || primaryField}
                      </th>
                      {config.fields.slice(0, 3).map((field: any) => 
                        field.name !== primaryField && (
                          <th key={field.name} className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-white">
                            {field.label || field.name}
                          </th>
                        )
                      )}
                      <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="stagger-animate">
                    {records.map((record, index) => (
                      <tr 
                        key={record.id} 
                        className={`table-row-animate border-b border-slate-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        <td className="p-4 text-teal-800 font-medium">
                          {getDisplayValue(record, primaryField)}
                        </td>
                        {config.fields.slice(0, 3).map((field: any) => 
                          field.name !== primaryField && (
                            <td key={field.name} className="p-4 text-teal-800">
                              {getDisplayValue(record, field.name)}
                            </td>
                          )
                        )}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="btn-animate hover-glow"
                            >
                              <Link href={`/${tableName}/${record.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="btn-animate hover-glow"
                            >
                              <Link href={`/${tableName}/${record.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DeleteButton
                              table={tableName}
                              id={record.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-slate-600">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalRecords)} of {totalRecords} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="btn-animate"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="btn-animate"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

