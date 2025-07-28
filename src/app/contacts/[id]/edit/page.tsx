import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { notFound } from "next/navigation";

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !contact) {
    notFound();
  }

  const config = tableConfigs.contacts;
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Contact</h1>
        <p className="text-gray-600 mt-2">Update contact information</p>
      </div>
      
      <EditForm table="contacts" config={config} initialData={contact} />
    </div>
  );
} 