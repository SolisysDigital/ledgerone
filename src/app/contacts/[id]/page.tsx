import React, { Suspense } from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { getApiUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, ArrowLeft, Trash2 } from "lucide-react";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import DetailObjectRelationships from "@/components/relationships/DetailObjectRelationships";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch contact data using the working API endpoint instead of direct Supabase
  const contactResponse = await fetch(getApiUrl(`/contacts/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!contactResponse.ok) {
    console.error('Failed to fetch contact data:', contactResponse.status, contactResponse.statusText);
    notFound();
  }

  const contact = await contactResponse.json();

  if (!contact) {
    notFound();
  }

  // Get entity relationships for this contact using the working API endpoint
  const relationshipsResponse = await fetch(getApiUrl(`/relationships/by-related-data?related_data_id=${id}&type_of_record=contacts`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let relationships = [];
  if (relationshipsResponse.ok) {
    const relationshipsData = await relationshipsResponse.json();
    // Convert single relationship to array for consistency
    relationships = relationshipsData ? [relationshipsData] : [];
  }

  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Simple Header without box */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button asChild variant="outline" size="sm" className="shadow-sm">
              <Link href="/contacts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Contact Details</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">ID: {id}</p>
                {(contact.name as string) && (
                  <span className="text-lg font-semibold text-white bg-teal-600 px-3 py-1 rounded-xl">
                    {contact.name as string}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/contacts/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-red-600">
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
                {tableConfigs.contacts.fields.map((field: any): React.ReactElement | null => {
                  // Skip certain fields that are handled separately
                  if (['id', 'created_at', 'updated_at', 'user_id'].includes(field.name)) {
                    return null;
                  }

                  // Get the field value from contact
                  const fieldValue = (contact as any)[field.name];
                  
                  // Format the field label (convert snake_case to Title Case)
                  const fieldLabel = field.label || field.name
                    .split('_')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <div key={field.name} className={`bg-muted/10 rounded-lg p-4 border border-border/50 ${
                      field.name === 'short_description' || field.name === 'description' ? 'col-span-2' : ''
                    }`} style={{ borderRadius: '0.5rem' }}>
                      <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                        {fieldLabel}
                      </Label>
                      <div className="text-sm">
                        {field.type === 'textarea' ? (
                          <div className="whitespace-pre-wrap bg-muted p-3 rounded-md">
                            {fieldValue ? fieldValue : 'Not specified'}
                          </div>
                        ) : (
                          <span className="text-teal-800 font-medium">
                            {fieldValue ? fieldValue : 'Not specified'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Related Entities Section */}
          <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg font-semibold">Related Entities</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/10 rounded-lg p-4 border border-border/50" style={{ borderRadius: '0.5rem' }}>
                <Suspense fallback={<div>Loading entity relationships...</div>}>
                  <DetailObjectRelationships detailObjectId={id} detailObjectType="contacts" />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientNavigationWrapper>
  );
} 