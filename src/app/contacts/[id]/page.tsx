import { tableConfigs } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, ArrowLeft, Trash2 } from "lucide-react";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
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
    .eq('related_data_id', id)
    .eq('type_of_record', 'contacts');

  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Simple Header without box */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
              <Link href="/contacts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Contact Details</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">ID: {id}</p>
                {contact.name && (
                  <span className="text-lg font-semibold text-white bg-teal-600 px-3 py-1 rounded-xl">
                    {contact.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150">
              <Link href={`/contacts/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150 text-red-600 hover:text-red-700">
              <Link href={`/contacts/${id}/delete`}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contact.name && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Name
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{contact.name}</span>
                    </div>
                  </div>
                )}
                {contact.title && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Title
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{contact.title}</span>
                    </div>
                  </div>
                )}
                {contact.email && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Email
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{contact.email}</span>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Phone
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{contact.phone}</span>
                    </div>
                  </div>
                )}
                {contact.description && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors md:col-span-2" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Description
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{contact.description}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Entities Section */}
          {relationships && relationships.length > 0 && (
            <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-semibold">Related Entities</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relationships.map((relationship: any) => (
                    <div key={relationship.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-border/50">
                      <div>
                        <h4 className="font-medium text-teal-800">{relationship.entities?.name || 'Unknown Entity'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {relationship.relationship_description || 'Existing Contact Relationship'}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/entities/${relationship.entity_id}`}>
                          View Entity
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ClientNavigationWrapper>
  );
} 