import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { notFound } from "next/navigation";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

interface Phone {
  id: string;
  phone?: string | null;
  label?: string | null;
  short_description?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface EditPhonePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPhonePage({ params }: EditPhonePageProps) {
  const { id } = await params;
  
  const { data: phone, error } = await supabase
    .from('phones')
    .select('*')
    .eq('id', id)
    .single() as { data: Phone | null; error: any };

  if (error || !phone) {
    notFound();
  }

  const config = tableConfigs.phones;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Phone</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-600">ID: {id}</p>
            {phone.phone && (
              <span className="text-lg font-semibold text-white bg-teal-600 px-3 py-1 rounded-xl">
                {phone.phone}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-2">Update phone information</p>
        </div>
        <Suspense fallback={<div>Loading form...</div>}>
          <EditForm table="phones" config={config} initialData={phone} />
        </Suspense>
      </div>
    </ClientNavigationWrapper>
  );
} 