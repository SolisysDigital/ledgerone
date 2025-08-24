import React from "react";
import { notFound } from "next/navigation";
import { tableConfigs } from "@/lib/tableConfigs";
import { getApiUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditForm from "./EditForm";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";

export default async function EditPage({ 
  params 
}: { 
  params: Promise<{ table: string; id: string }> 
}) {
  const resolvedParams = await params;
  const { table, id } = resolvedParams;
  
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return notFound();

  // Fetch existing data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/${table}/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${table} data for edit:`, response.status, response.statusText);
    return notFound();
  }

  const data = await response.json();

  if (!data) return notFound();

  // Determine primary name based on entity type
  const getPrimaryName = (table: string, data: any): string | undefined => {
    switch (table) {
      case 'credit_cards':
        return data.cardholder_name;
      case 'hosting_accounts':
        return data.account_name || data.provider;
      case 'crypto_accounts':
        return data.account_name || data.platform;
      case 'investment_accounts':
        return data.account_name || data.provider;
      case 'bank_accounts':
        return data.account_name || data.bank_name;
      case 'contacts':
        return data.name;
      case 'phones':
        return data.phone;
      case 'emails':
        return data.email;
      case 'websites':
        return data.url || data.label;
      default:
        return data.name || data.account_name || data.provider || data.domain_name || data.bank_name || data.phone || data.email_address || data.platform || data.cardholder_name;
    }
  };

  const primaryName = getPrimaryName(table, data);

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title={`Edit ${config.label}`}
          id={id}
          primaryName={primaryName}
          backHref={`/${table}/${id}`}
        />

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