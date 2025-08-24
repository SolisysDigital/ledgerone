import React from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";
import { getApiUrl } from "@/lib/utils";
import { CryptoAccount } from "@/lib/entities/crypto-account.fields";

export default async function EditCryptoAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.crypto_accounts;
  if (!config) return notFound();

  // Fetch crypto account data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/crypto-accounts/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch crypto account data for edit:', response.status, response.statusText);
    return notFound();
  }

  const cryptoAccount = await response.json();

  if (!cryptoAccount) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Crypto Account"
          id={id}
          primaryName={cryptoAccount.platform}
          backHref={`/crypto-accounts/${id}`}
        />

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Update Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm table="crypto_accounts" config={config} initialData={cryptoAccount} />
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
}
