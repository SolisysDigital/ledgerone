import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import CreateForm from "@/app/[table]/new/CreateForm";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default function NewBankAccountPage() {
  const config = tableConfigs.bank_accounts;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Add New Bank Account</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <CreateForm table="bank_accounts" config={config} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 