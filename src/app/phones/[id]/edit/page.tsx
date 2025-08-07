import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { notFound } from "next/navigation";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

interface EditPhonePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPhonePage({ params }: EditPhonePageProps) {
  const { id } = await params;
  
  const { data: phone, error } = await supabase
    .from('phones')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !phone) {
    notFound();
  }

  const config = tableConfigs.phones;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Phone</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <EditForm table="phones" config={config} initialData={phone} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 