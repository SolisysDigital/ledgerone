import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { notFound } from "next/navigation";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

interface EditBankAccountPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBankAccountPage({ params }: EditBankAccountPageProps) {
  const { id } = await params;
  
  const { data: account, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !account) {
    notFound();
  }

  const config = tableConfigs.bank_accounts;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Bank Account</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <EditForm table="bank_accounts" config={config} initialData={account} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 