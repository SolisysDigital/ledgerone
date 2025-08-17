import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { notFound } from "next/navigation";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !contact) {
    notFound();
  }

  const config = tableConfigs.contacts;
  
  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Contact</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-600">ID: {id}</p>
            {(contact.name as string) && (
              <span className="text-lg font-semibold text-white bg-teal-600 px-3 py-1 rounded-xl">
                {contact.name as string}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-2">Update contact information</p>
        </div>
        
        <EditForm table="contacts" config={config} initialData={contact} />
      </div>
    </ClientNavigationWrapper>
  );
} 