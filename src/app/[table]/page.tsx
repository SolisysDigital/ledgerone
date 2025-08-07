"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from "@/components/Navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { SearchSection } from '@/components/layout/SearchSection';
import { DataTable } from '@/components/tables/DataTable';
import { Pagination } from '@/components/layout/Pagination';
import { LoadingState } from '@/components/layout/LoadingState';
import { EmptyState } from '@/components/layout/EmptyState';
import { tableConfigs } from '@/lib/tableConfigs';
import { Eye, Plus } from 'lucide-react';

interface Record {
  id: string;
  [key: string]: any;
}

interface TablePageProps {
  params: Promise<{
    table: string;
  }>;
}

export default function TablePage(_params: TablePageProps) {
  const resolvedParams = useParams();
  const table = Array.isArray(resolvedParams.table) ? resolvedParams.table[0] : resolvedParams.table;
  
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const config = tableConfigs[table as keyof typeof tableConfigs];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        search: searchQuery,
      });
      
      const response = await fetch(`/api/${table}?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRecords(data.records || []);
      setTotalPages(data.totalPages || 1);
      setTotalRecords(data.totalRecords || 0);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (table && config) {
      fetchRecords();
    }
  }, [table, currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (id: string) => {
    window.location.href = `/${table}/${id}`;
  };

  const handleEdit = (id: string) => {
    window.location.href = `/${table}/${id}/edit`;
  };

  const handleVisualize = (id: string) => {
    window.location.href = `/${table}/${id}/visualize`;
  };

  if (!config) {
    return (
      <div className="flex h-screen">
        <Navigation />
        <main className="flex-1 overflow-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Table Not Found</h1>
            <p className="text-gray-600 mt-2">The table &quot;{table}&quot; is not configured.</p>
          </div>
        </main>
      </div>
    );
  }

  const columns = config.fields
    .filter(field => ['text', 'textarea', 'select', 'number', 'date'].includes(field.type))
    .slice(0, 4) // Limit to first 4 fields for table display
    .map(field => ({
      key: field.name,
      label: field.label || field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <PageLayout
          title={config.label}
          subtitle={`Manage your ${config.label.toLowerCase()} data`}
          actionButton={
            <Button asChild>
              <Link href={`/${table}/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add New {config.label.slice(0, -1)}
              </Link>
            </Button>
          }
        >
          <SearchSection
            placeholder={`Search ${config.label.toLowerCase()}...`}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Records ({totalRecords})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingState />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : records.length === 0 ? (
                <EmptyState
                  message={searchQuery ? 'No records found matching your search.' : `No ${config.label.toLowerCase()} records found.`}
                  actionText={`Create ${config.label.slice(0, -1)}`}
                  actionHref={`/${table}/new`}
                />
              ) : (
                <>
                  <DataTable
                    data={records}
                    columns={columns}
                    tableName={table as string}
                    loading={false}
                    onView={handleView}
                    onEdit={handleEdit}
                    onVisualize={handleVisualize}
                  />
                  
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </PageLayout>
      </main>
    </div>
  );
}

