import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { tableConfigs } from "@/lib/tableConfigs";
import { getApiUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowLeft, Users, FileText, Building2 } from "lucide-react";
import Link from "next/link";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import ClientRelationshipTabs from "@/components/relationships/ClientRelationshipTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecordHeader from "@/components/record/RecordHeader";
import { DetailsGrid } from "@/components/record/DetailsGrid";

export default async function EntityPage({ 
  params 
}: { 
  params: Promise<{ table: string; id: string }> 
}) {
  const resolvedParams = await params;
  const { table, id } = resolvedParams;
  
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return notFound();

  // Fetch existing data using the working API endpoint instead of direct Supabase
  const response = await fetch(getApiUrl(`/${table}/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${table} data:`, response.status, response.statusText);
    return notFound();
  }

  const data = await response.json();

  if (!data) return notFound();

  // Determine primary name based on entity type
  const getPrimaryName = (table: string, data: any): string | undefined => {
    switch (table) {
      case 'credit_cards':
        return data.cardholder_name;
      case 'hosting_accounts':
        return data.account_name || data.provider;
      case 'crypto_accounts':
        return data.account_name || data.platform;
      case 'investment_accounts':
        return data.account_name || data.provider;
      case 'bank_accounts':
        return data.account_name || data.bank_name;
      case 'contacts':
        return data.name;
      case 'phones':
        return data.phone;
      case 'emails':
        return data.email;
      case 'websites':
        return data.url || data.label;
      default:
        return data.name || data.account_name || data.provider || data.domain_name || data.bank_name || data.phone || data.email_address || data.platform || data.cardholder_name;
    }
  };

  const primaryName = getPrimaryName(table, data);

  // Get display fields for the entity type
  const getDisplayFields = (table: string): string[] => {
    switch (table) {
      case 'credit_cards':
        return ['cardholder_name', 'card_number', 'issuer', 'type', 'institution_held_at', 'purpose', 'last_balance', 'short_description', 'description'];
      case 'hosting_accounts':
        return ['provider', 'login_url', 'username', 'password', 'short_description', 'description'];
      case 'crypto_accounts':
        return ['platform', 'account_number', 'wallet_address', 'institution_held_at', 'purpose', 'last_balance', 'short_description', 'description'];
      case 'investment_accounts':
        return ['provider', 'account_type', 'account_number', 'institution_held_at', 'purpose', 'last_balance', 'short_description', 'description'];
      case 'bank_accounts':
        return ['bank_name', 'account_number', 'routing_number', 'institution_held_at', 'purpose', 'last_balance', 'short_description', 'description'];
      case 'contacts':
        return ['name', 'title', 'email', 'phone', 'short_description', 'description'];
      case 'phones':
        return ['phone', 'label', 'short_description', 'description'];
      case 'emails':
        return ['email', 'label', 'short_description', 'description'];
      case 'websites':
        return ['url', 'label', 'short_description', 'description'];
      default:
        return config.fields.map(f => f.name);
    }
  };

  const displayFields = getDisplayFields(table);

  // Define field types for proper formatting
  const fieldTypes: Record<string, 'text' | 'textarea' | 'select' | 'number' | 'date'> = {
    'last_balance': 'number',
    'description': 'textarea',
    'short_description': 'text',
  };

  // Define field labels for better display
  const fieldLabels: Record<string, string> = {
    'cardholder_name': 'Cardholder Name',
    'card_number': 'Card Number',
    'institution_held_at': 'Institution Held At',
    'short_description': 'Short Description',
    'account_type': 'Account Type',
    'wallet_address': 'Wallet Address',
    'routing_number': 'Routing Number',
  };

  // Actions for the header
  const actions = (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/${table}/${id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="text-red-600">
        <Link href={`/${table}/${id}/delete`}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Link>
      </Button>
    </>
  );

  // For non-entities, use the simple layout
  if (table !== 'entities') {
    return (
      <ClientNavigationWrapper>
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          {/* Main Header */}
          <RecordHeader
            title={`${config.label} Details`}
            id={id}
            primaryName={primaryName}
            backHref={`/${table}`}
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
                data={data}
                displayFields={displayFields as Array<keyof typeof data>}
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

  // For entities, use the tabbed structure
  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Main Header without box */}
        <RecordHeader
          title="Entity Details"
          id={id}
          primaryName={primaryName}
          backHref={`/${table}`}
          actions={actions}
        />

        {/* Tabs Structure */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="information" className="w-full">
              <TabsList className={`border-b border-gray-200 bg-gray-100 rounded-t-lg h-16 p-2 ${table === 'entities' ? 'grid-cols-2' : 'grid-cols-1'} grid w-full`}>
                <TabsTrigger value="information" className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:rounded-t-lg data-[state=active]:font-semibold rounded-md border-b border-gray-200">
                  <FileText className="h-4 w-4 mr-2" />
                  Information
                </TabsTrigger>
                {table === 'entities' && (
                  <TabsTrigger value="relationships" className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:rounded-t-lg data-[state=active]:font-semibold rounded-md border-b border-gray-200">
                    <Users className="h-4 w-4 mr-2" />
                    Relationships
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="information" className="p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                    </div>
                    <DetailsGrid
                      data={data}
                      displayFields={displayFields as Array<keyof typeof data>}
                      fieldLabels={fieldLabels}
                    />
                  </div>
                </div>
              </TabsContent>

              {table === 'entities' && (
                <TabsContent value="relationships" className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      <h3 className="text-lg font-semibold">Entity Relationships</h3>
                    </div>
                    <div className="bg-muted/10 rounded-lg p-4 border border-border/50" style={{ borderRadius: '0.5rem' }}>
                      <Suspense fallback={<div>Loading relationships...</div>}>
                        <ClientRelationshipTabs entityId={id} />
                      </Suspense>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
} 