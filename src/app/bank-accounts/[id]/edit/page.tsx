import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";
import { BankAccount } from "@/lib/entities/bank-account.fields";

export default async function EditBankAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.bank_accounts;
  if (!config) return notFound();

  // Fetch existing data
  const { data: bankAccount, error } = await supabase
    .from('bank_accounts')
    .select("*")
    .eq("id", id)
    .single() as { data: BankAccount | null; error: any };

  if (error || !bankAccount) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Bank Account"
          id={id}
          primaryName={bankAccount.bank_name}
          backHref={`/bank-accounts/${id}`}
        />

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Update Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm table="bank_accounts" config={config} initialData={bankAccount} />
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
} 