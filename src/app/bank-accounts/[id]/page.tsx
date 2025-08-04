import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface BankAccountDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BankAccountDetailPage({ params }: BankAccountDetailPageProps) {
  const { id } = await params;
  
  const { data: account, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !account) {
    notFound();
  }

  // Get relationships for this bank account
  const { data: relationships, error: relationshipsError } = await supabase
    .from('entity_related_data')
    .select(`
      id,
      entity_id,
      relationship_description,
      entities!inner(name)
    `)
    .eq('related_data_id', id)
    .eq('type_of_record', 'bank_accounts');

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bank Account Details</h1>
        <div className="flex space-x-2">
          <Link href="/bank-accounts">
            <Button variant="outline">Back to Bank Accounts</Button>
          </Link>
          <Link href={`/bank-accounts/${id}/edit`}>
            <Button>Edit Bank Account</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <p className="text-teal-800 mt-1">{account.bank_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Account Number</label>
              <p className="text-teal-800 mt-1">{account.account_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Account Type</label>
              <p className="text-teal-800 mt-1">{account.account_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-teal-800 mt-1">{account.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Entities</CardTitle>
          </CardHeader>
          <CardContent>
            {relationships && relationships.length > 0 ? (
              <div className="space-y-4">
                {relationships.map((relationship: any) => (
                  <div key={relationship.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-teal-800">{relationship.entities.name}</h3>
                      <p className="text-sm text-gray-600">{relationship.relationship_description}</p>
                    </div>
                    <Link href={`/entities/${relationship.entity_id}`}>
                      <Button variant="outline" size="sm">
                        View Entity
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">This bank account is not related to any entities yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 