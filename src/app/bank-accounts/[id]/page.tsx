import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Building2 } from "lucide-react";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

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
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Simple Header without box */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
              <Link href="/bank-accounts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Bank Account Details</h1>
              <p className="text-sm text-muted-foreground">ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-teal-400 hover:bg-teal-50">
              <Link href={`/bank-accounts/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2 text-gray-700 hover:text-teal-700" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700">
              <Link href={`/bank-accounts/${id}/delete`}>
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
                {account.bank_name && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Bank Name
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{account.bank_name}</span>
                    </div>
                  </div>
                )}
                {account.account_number && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Account Number
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{account.account_number}</span>
                    </div>
                  </div>
                )}
                {account.routing_number && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Routing Number
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{account.routing_number}</span>
                    </div>
                  </div>
                )}
                {account.institution_held_at && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Institution Held At
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{account.institution_held_at}</span>
                    </div>
                  </div>
                )}
                {account.purpose && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Purpose
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{account.purpose}</span>
                    </div>
                  </div>
                )}
                {account.last_balance && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Last Balance
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">${account.last_balance}</span>
                    </div>
                  </div>
                )}
                {account.description && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors md:col-span-2" style={{ borderRadius: '0.5rem' }}>
                    <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                      Description
                    </Label>
                    <div className="text-sm">
                      <span className="text-teal-800 font-medium">{account.description}</span>
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
                          {relationship.relationship_description || 'Existing Bank Account Relationship'}
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