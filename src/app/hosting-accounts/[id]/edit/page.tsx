import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";

export default async function EditHostingAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.hosting_accounts;
  if (!config) return notFound();

  // Fetch existing data
  const { data: hostingAccount, error } = await supabase
    .from('hosting_accounts')
    .select("*")
    .eq("id", id)
    .single();

  if (error || !hostingAccount) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Hosting Account"
          id={id}
          primaryName={hostingAccount.account_name || hostingAccount.provider}
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
