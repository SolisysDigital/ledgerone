import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";

export default async function EditInvestmentAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.investment_accounts;
  if (!config) return notFound();

  // Fetch existing data
  const { data: investmentAccount, error } = await supabase
    .from('investment_accounts')
    .select("*")
    .eq("id", id)
    .single();

  if (error || !investmentAccount) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Investment Account"
          id={id}
          primaryName={investmentAccount.account_name || investmentAccount.provider}
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
