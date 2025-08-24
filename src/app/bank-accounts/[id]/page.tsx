import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import ClientRelationshipTabs from "@/components/relationships/ClientRelationshipTabs";
import RecordHeader from "@/components/record/RecordHeader";
import { DetailsGrid } from "@/components/record/DetailsGrid";
import { bankAccountDisplayFields, BankAccount } from "@/lib/entities/bank-account.fields";

export default async function BankAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  // Fetch bank account data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/bank-accounts/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch bank account data:', response.status, response.statusText);
    return notFound();
  }

  const bankAccount = await response.json() as BankAccount;

  if (!bankAccount) return notFound();

  // Actions for the header
  const actions = (
    <>
      <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150">
        <Link href={`/bank-accounts/${id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150 text-red-600 hover:text-red-700">
        <Link href={`/bank-accounts/${id}/delete`}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Link>
      </Button>
    </>
  );

  // Define field labels for better display
  const fieldLabels: Record<string, string> = {
    'bank_name': 'Bank Name',
    'account_number': 'Account Number',
    'routing_number': 'Routing Number',
    'institution_held_at': 'Institution Held At',
    'short_description': 'Short Description',
    'last_balance': 'Last Balance',
  };

  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Main Header */}
        <RecordHeader
          title="Bank Account Details"
          id={id}
          primaryName={bankAccount.bank_name}
          backHref="/bank-accounts"
          actions={actions}
        />

        {/* Basic Information Section */}
        <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
          </CardHeader>
          <CardContent>
            <DetailsGrid
              data={bankAccount}
              displayFields={bankAccountDisplayFields}
              fieldLabels={fieldLabels}
            />
          </CardContent>
        </Card>

        {/* Related Data Section */}
        <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg font-semibold">Related Information</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/10 rounded-lg p-4 border border-border/50" style={{ borderRadius: '0.5rem' }}>
              <Suspense fallback={<div>Loading relationships...</div>}>
                <ClientRelationshipTabs entityId={id} />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
} 