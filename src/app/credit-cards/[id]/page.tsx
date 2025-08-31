import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import DetailObjectRelationships from "@/components/relationships/DetailObjectRelationships";
import RecordHeader from "@/components/record/RecordHeader";
import { DetailsGrid } from "@/components/record/DetailsGrid";
import { creditCardDisplayFields } from "@/lib/entities/credit-card.fields";

export default async function CreditCardPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  // Fetch credit card data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/credit-cards/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch credit card data:', response.status, response.statusText);
    return notFound();
  }

  const creditCard = await response.json();

  if (!creditCard) return notFound();

  // Actions for the header
  const actions = (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/credit-cards/${id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="text-red-600">
        <Link href={`/credit-cards/${id}/delete`}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Link>
      </Button>
    </>
  );

  // Define field labels for better display
  const fieldLabels: Record<string, string> = {
    'cardholder_name': 'Cardholder Name',
    'card_number': 'Card Number',
    'institution_held_at': 'Institution Held At',
    'short_description': 'Short Description',
    'last_balance': 'Last Balance',
  };

  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Main Header */}
        <RecordHeader
          title="Credit Card Details"
          id={id}
          primaryName={creditCard.cardholder_name as string}
          backHref="/credit-cards"
          actions={actions}
        />

        {/* Basic Information Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
          </CardHeader>
          <CardContent>
            <DetailsGrid
              data={creditCard}
              displayFields={creditCardDisplayFields}
              fieldLabels={fieldLabels}
            />
          </CardContent>
        </Card>

        {/* Related Entities Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg font-semibold">Related Entities</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/10 rounded-lg p-4 border border-border/50" style={{ borderRadius: '0.5rem' }}>
              <Suspense fallback={<div>Loading entity relationships...</div>}>
                <DetailObjectRelationships detailObjectId={id} detailObjectType="credit_cards" />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
}
