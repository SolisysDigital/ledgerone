import React from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";
import { HostingAccount } from "@/lib/entities/hosting-account.fields";
import { getApiUrl } from "@/lib/utils";

export default async function EditHostingAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.hosting_accounts;
  if (!config) return notFound();

  // Fetch hosting account data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/hosting-accounts/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch hosting account data for edit:', response.status, response.statusText);
    return notFound();
  }

  const hostingAccount = await response.json();

  if (!hostingAccount) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Hosting Account"
          id={id}
          primaryName={hostingAccount.provider}
          backHref={`/hosting-accounts/${id}`}
        />

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Update Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm table="hosting_accounts" config={config} initialData={hostingAccount} />
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
}
