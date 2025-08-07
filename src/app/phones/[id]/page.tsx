import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

interface PhoneDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhoneDetailPage({ params }: PhoneDetailPageProps) {
  const { id } = await params;
  
  const { data: phone, error } = await supabase
    .from('phones')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !phone) {
    notFound();
  }

  // Get relationships for this phone
  const { data: relationships, error: relationshipsError } = await supabase
    .from('entity_related_data')
    .select(`
      id,
      entity_id,
      relationship_description,
      entities!inner(name)
    `)
    .eq('related_data_id', id)
    .eq('type_of_record', 'phones');

  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Simple Header without box */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
              <Link href="/phones">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Phone Details</h1>
              <p className="text-sm text-muted-foreground">ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/phones/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow text-destructive hover:text-destructive">
              <Link href={`/phones/${id}/delete`}>
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
                {phone.phone && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Phone Number
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{phone.phone}</span>
                    </div>
                  </div>
                )}
                {phone.label && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Label
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{phone.label}</span>
                    </div>
                  </div>
                )}
                {phone.description && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors md:col-span-2" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Description
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{phone.description}</span>
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