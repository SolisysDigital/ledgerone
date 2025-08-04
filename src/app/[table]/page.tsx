"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { tableConfigs } from "@/lib/tableConfigs";
import { STYLES, ICONS } from "@/styles/constants";
import { PageLayout } from "@/components/layout/PageLayout";
import { SearchSection } from "@/components/layout/SearchSection";
import { DataTable } from "@/components/tables/DataTable";
import { Pagination } from "@/components/layout/Pagination";

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

  const getPrimaryField = () => {
    if (!config) return 'id';
    
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

  const columns = [
    {
      key: primaryField,
      label: config.fields.find((f: any) => f.name === primaryField)?.label || primaryField,
    },
    ...(config.fields.slice(0, 3)
      .filter((field: any) => field.name !== primaryField)
      .map((field: any) => ({
        key: field.name,
        label: field.label || field.name,
      })) || [])
  ];

  const handleView = (id: string) => {
    window.location.href = `/${tableName}/${id}`;
  };

  const handleEdit = (id: string) => {
    window.location.href = `/${tableName}/${id}/edit`;
  };

  return (
    <PageLayout
      title={config.label}
      subtitle={`Manage your ${config.label.toLowerCase()} data`}
      actionButton={
        <Button asChild className={STYLES.BUTTONS.PRIMARY}>
          <Link href={`/${tableName}/new`}>
            <div className={ICONS.PLUS} />
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

      <Card className={STYLES.COLORS.CARD_STANDARD}>
        <CardHeader>
          <CardTitle className={STYLES.LAYOUT.CARD_HEADER}>
            <Eye className={ICONS.EYE} />
            Records ({totalRecords})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={records}
            columns={columns}
            tableName={tableName}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}

