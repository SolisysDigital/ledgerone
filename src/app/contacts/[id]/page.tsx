import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, ArrowLeft } from "lucide-react";

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !contact) {
    notFound();
  }

  // Get entity relationships for this contact
  const { data: relationships, error: relationshipError } = await supabase
    .from('entity_related_data')
    .select(`
      id,
      entity_id,
      relationship_description,
      entities!inner(name)
    `)
    .eq('related_data_id', params.id)
    .eq('type_of_record', 'contacts');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/contacts" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contacts
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{contact.name}</h1>
            {contact.title && (
              <p className="text-xl text-gray-600 mt-2">{contact.title}</p>
            )}
          </div>
          <Link href={`/contacts/${params.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Contact
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.email && (
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-teal-800">{contact.email}</p>
                </div>
              )}
              {contact.phone && (
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-teal-800">{contact.phone}</p>
                </div>
              )}
              {contact.description && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-teal-800">{contact.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entity Relationships */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            {relationships && relationships.length > 0 ? (
              <div className="space-y-4">
                {relationships.map((relationship: any) => (
                  <div key={relationship.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{relationship.entities.name}</h3>
                      {relationship.relationship_description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {relationship.relationship_description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Related Entity</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">This contact is not related to any entities yet</p>
                <p className="text-sm text-gray-400">
                  You can relate this contact to entities from the entity detail pages
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 