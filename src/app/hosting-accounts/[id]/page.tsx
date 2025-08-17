import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";
import ClientRelationshipTabs from "@/components/relationships/ClientRelationshipTabs";
import RecordHeader from "@/components/record/RecordHeader";
import { DetailsGrid } from "@/components/record/DetailsGrid";
import { hostingAccountDisplayFields } from "@/lib/entities/hosting-account.fields";

export default async function HostingAccountPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  // Fetch hosting account data
  const { data: hostingAccount, error } = await supabase
    .from('hosting_accounts')
    .select("*")
    .eq("id", id)
    .single();

  if (error || !hostingAccount) return notFound();

  // Actions for the header
  const actions = (
    <>
      <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150">
        <Link href={`/hosting-accounts/${id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150 text-red-600 hover:text-red-700">
        <Link href={`/hosting-accounts/${id}/delete`}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Link>
      </Button>
    </>
  );

  // Define field labels for better display
  const fieldLabels: Record<string, string> = {
    'login_url': 'Login URL',
    'short_description': 'Short Description',
  };

  return (
    <ClientNavigationWrapper>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Main Header */}
        <RecordHeader
          title="Hosting Account Details"
          id={id}
          primaryName={hostingAccount.account_name || hostingAccount.provider}
          backHref="/hosting-accounts"
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
              data={hostingAccount}
              displayFields={hostingAccountDisplayFields}
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
