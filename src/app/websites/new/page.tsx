import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import CreateForm from "@/app/[table]/new/CreateForm";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default function NewWebsitePage() {
  const config = tableConfigs.websites;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Add New Website</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <CreateForm table="websites" config={config} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 