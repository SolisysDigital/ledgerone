import { tableConfigs } from "@/lib/tableConfigs";
import CreateForm from "@/app/[table]/new/CreateForm";
import { Suspense } from "react";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default function NewContactPage() {
  const config = tableConfigs.contacts;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Contact</h1>
          <p className="text-gray-600 mt-2">Add a new contact that can be related to entities later</p>
        </div>
        
        <Suspense fallback={<div>Loading form...</div>}>
          <CreateForm table="contacts" config={config} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 