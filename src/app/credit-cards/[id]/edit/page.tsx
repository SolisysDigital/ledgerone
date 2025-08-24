import React from "react";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import RecordHeader from "@/components/record/RecordHeader";
import EditForm from "@/app/[table]/[id]/edit/EditForm";
import { tableConfigs } from "@/lib/tableConfigs";

export default async function EditCreditCardPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const config = tableConfigs.credit_cards;
  if (!config) return notFound();

  // Fetch credit card data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/credit-cards/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch credit card data for edit:', response.status, response.statusText);
    return notFound();
  }

  const creditCard = await response.json();

  if (!creditCard) return notFound();

  return (
    <ClientNavigationWrapper>
      <div className="space-y-6">
        {/* Header */}
        <RecordHeader
          title="Edit Credit Card"
          id={id}
          primaryName={creditCard.cardholder_name as string}
          backHref={`/credit-cards/${id}`}
        />

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Update Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditForm table="credit_cards" config={config} initialData={creditCard} />
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
}
