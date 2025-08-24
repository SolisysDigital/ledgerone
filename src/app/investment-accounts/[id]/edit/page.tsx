import React from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";
import { getApiUrl } from "@/lib/utils";
import { InvestmentAccount } from "@/lib/entities/investment-account.fields";

export default async function EditInvestmentAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.investment_accounts;
  if (!config) return notFound();

  // Fetch investment account data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/investment-accounts/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch investment account data for edit:', response.status, response.statusText);
    return notFound();
  }

  const investmentAccount = await response.json();

  if (!investmentAccount) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Investment Account"
          id={id}
          primaryName={investmentAccount.provider}
          backHref={`/investment-accounts/${id}`}
        />

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Update Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm table="investment_accounts" config={config} initialData={investmentAccount} />
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
}
