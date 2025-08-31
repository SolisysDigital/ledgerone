import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import { tableConfigs } from "@/lib/tableConfigs";
import { getApiUrl } from "@/lib/utils";

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

interface PhoneDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhoneDetailPage({ params }: PhoneDetailPageProps) {
  const { id } = await params;
  
  // Fetch phone data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/phones/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch phone data:', response.status, response.statusText);
    return notFound();
  }

  const phone = await response.json();

  if (!phone) return notFound();

  // Get relationships for this phone using the API endpoint
  let relationships = [];
  try {
    const relationshipsResponse = await fetch(getApiUrl(`/relationships?related_data_id=${id}&type_of_record=phones`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (relationshipsResponse.ok) {
      const relationshipsData = await relationshipsResponse.json();
      relationships = relationshipsData.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch relationships:', error);
    relationships = [];
  }

  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Simple Header without box */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button asChild variant="outline" size="sm" className="shadow-sm">
              <Link href="/phones">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Phone Details</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">ID: {id}</p>
                {phone.phone && (
                  <span className="text-lg font-semibold text-white bg-teal-600 px-3 py-1 rounded-xl">
                    {phone.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/phones/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-red-600">
              <Link href={`/phones/${id}/delete`}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tableConfigs.phones.fields.map((field) => {
                  // Skip certain fields that are handled separately
                  if (['id', 'created_at', 'updated_at', 'user_id'].includes(field.name)) {
                    return null;
                  }

                  // Get the field value from phone
                  const fieldValue = (phone as any)[field.name];
                  
                  // Format the field label (convert snake_case to Title Case)
                  const fieldLabel = field.label || field.name
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
                            {fieldValue ? fieldValue : 'No description provided'}
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
          {relationships && relationships.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-white/50">
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
                        <h4 className="font-medium text-teal-800">{relationship.entity_name || 'Unknown Entity'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {relationship.relationship_description || 'Existing Phone Relationship'}
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