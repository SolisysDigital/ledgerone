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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Bank Account</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm text-muted-foreground">ID: {id}</p>
              {account.bank_name && (
                <span className="text-lg font-semibold text-white bg-teal-600 px-3 py-1 rounded-xl">
                  {account.bank_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <Suspense fallback={<div>Loading form...</div>}>
          <EditForm table="bank_accounts" config={config} initialData={account} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 