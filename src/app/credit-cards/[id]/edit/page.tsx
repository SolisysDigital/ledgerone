import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

  // Fetch existing data
  const { data: creditCard, error } = await supabase
    .from('credit_cards')
    .select("*")
    .eq("id", id)
    .single();

  if (error || !creditCard) return notFound();

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
