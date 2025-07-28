import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import CreateForm from "@/app/[table]/new/CreateForm";

export default function NewHostingAccountPage() {
  const config = tableConfigs.hosting_accounts;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Hosting Account</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <CreateForm table="hosting_accounts" config={config} />
      </Suspense>
    </div>
  );
} 