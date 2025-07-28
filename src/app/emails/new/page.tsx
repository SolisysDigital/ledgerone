import { tableConfigs } from "@/lib/tableConfigs";
import CreateForm from "@/app/[table]/new/CreateForm";
import { Suspense } from "react";

export default function NewEmailPage() {
  const config = tableConfigs.emails;
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Email</h1>
        <p className="text-gray-600 mt-2">Add a new email that can be related to entities later</p>
      </div>
      
      <Suspense fallback={<div>Loading form...</div>}>
        <CreateForm table="emails" config={config} />
      </Suspense>
    </div>
  );
} 