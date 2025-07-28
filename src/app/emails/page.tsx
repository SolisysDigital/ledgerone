import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function EmailsPage() {
  const { data: emails, error } = await supabase
    .from('emails')
    .select('*')
    .order('email');

  if (error) {
    console.error('Error fetching emails:', error);
    return <div>Error loading emails</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Emails</h1>
          <p className="text-gray-600 mt-2">Manage all emails independently</p>
        </div>
        <Link href="/emails/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Email
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {emails && emails.length > 0 ? (
          emails.map((email) => (
            <Card key={email.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{email.email}</CardTitle>
                    {email.label && (
                      <p className="text-gray-600 mt-1">{email.label}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/emails/${email.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/emails/${email.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {email.description && (
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-teal-800">{email.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No emails found</p>
              <Link href="/emails/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Email
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 