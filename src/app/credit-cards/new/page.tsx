import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import CreateForm from "@/app/[table]/new/CreateForm";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default function NewCreditCardPage() {
  const config = tableConfigs.credit_cards;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Add New Credit Card</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <CreateForm table="credit_cards" config={config} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 