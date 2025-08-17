import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";

export default async function EditCryptoAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.crypto_accounts;
  if (!config) return notFound();

  // Fetch existing data
  const { data: cryptoAccount, error } = await supabase
    .from('crypto_accounts')
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cryptoAccount) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Crypto Account"
          id={id}
          primaryName={cryptoAccount.account_name || cryptoAccount.platform}
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
