import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ContactsPage() {
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching contacts:', error);
    return <div>Error loading contacts</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage all contacts independently</p>
        </div>
        <Link href="/contacts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {contacts && contacts.length > 0 ? (
          contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{contact.name}</CardTitle>
                    {contact.title && (
                      <p className="text-gray-600 mt-1">{contact.title}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/contacts/${contact.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/contacts/${contact.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
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
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No contacts found</p>
              <Link href="/contacts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Contact
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 