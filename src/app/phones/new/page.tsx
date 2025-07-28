import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import CreateForm from "@/app/[table]/new/CreateForm";

export default function NewPhonePage() {
  const config = tableConfigs.phones;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Phone</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <CreateForm table="phones" config={config} />
      </Suspense>
    </div>
  );
} 