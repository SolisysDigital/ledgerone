import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordian";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the client component to avoid hydration issues
const ClientRelationshipTabs = dynamic(
  () => import("@/components/relationships/ClientRelationshipTabs"),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading relationships...</div>
  }
);

export default async function DetailPage({ 
  params 
}: { 
  params: Promise<{ table: string; id: string }> 
}) {
  try {
    console.log('DetailPage: Starting to resolve params');
    const resolvedParams = await params;
    const { table, id } = resolvedParams;
    
    console.log('DetailPage: Params resolved', { table, id });
    
    const config = tableConfigs[table as keyof typeof tableConfigs];
    if (!config) {
      console.log('DetailPage: Config not found for table', table);
      return notFound();
    }

    console.log('DetailPage: Fetching data from table', table, 'with id', id);
    
    // Use simple select to avoid join syntax issues
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error('DetailPage: Database error', error);
      return notFound();
    }
    
    if (!data) {
      console.log('DetailPage: No data found');
      return notFound();
    }

    console.log('DetailPage: Data fetched successfully', { table, id, dataKeys: Object.keys(data) });

    // Helper: group fields
    const legalInfoFields = [
      'legal_business_name',
      'employer_identification_number',
      'incorporation_date',
      'country_of_formation',
      'state_of_formation',
      'business_type',
      'industry',
      'naics_code',
      'legal_address',
      'mailing_address',
      'registered_agent_name',
      'registered_agent_address',
    ];
    const officerFields = [
      ['officer1_name', 'officer1_title', 'officer1_ownership_percent'],
      ['officer2_name', 'officer2_title', 'officer2_ownership_percent'],
      ['officer3_name', 'officer3_title', 'officer3_ownership_percent'],
      ['officer4_name', 'officer4_title', 'officer4_ownership_percent'],
    ];
    const texasFields = [
      'texas_taxpayer_number',
      'texas_file_number',
      'texas_webfile_number',
      'texas_webfile_login',
      'texas_webfile_password',
    ];
    const stateOfFormation = data['state_of_formation'];

    console.log('DetailPage: Rendering component');

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/${table}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold">{config.label} Details</h1>
              <p className="text-xs text-muted-foreground">ID: {id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href={`/${table}/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Data with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Entity Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="information" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="information" className="bg-blue-100 data-[state=active]:bg-blue-200">Information</TabsTrigger>
                <TabsTrigger value="related-data" className="bg-blue-100 data-[state=active]:bg-blue-200">Related Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="information" className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.fields.filter((f) => !legalInfoFields.includes(f.name) && !officerFields.flat().includes(f.name) && !texasFields.includes(f.name)).map((field) => {
                    const value = (data as any)[field.name];
                    if (!value && value !== 0) return null;
                    return (
                      <div key={field.name} className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground capitalize underline">
                          {field.label || field.name.replace(/_/g, ' ')}
                        </Label>
                        <div className="text-sm">
                          {field.type === "select" ? (
                            <Badge variant="secondary" className="text-teal-800">{value}</Badge>
                          ) : field.type === "textarea" ? (
                            <p className="whitespace-pre-wrap text-teal-800">{value}</p>
                          ) : field.type === "date" ? (
                            <span className="text-teal-800">{value ? new Date(value).toLocaleDateString() : '-'}</span>
                          ) : field.type === "number" ? (
                            <span className="text-teal-800">{value?.toLocaleString() || '-'}</span>
                          ) : (
                            <span className="text-teal-800">{value}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legal Info Accordion */}
                {table === 'entities' && (
                  <Accordion type="single" collapsible className="w-full mt-8">
                    <AccordionItem value="legal-info">
                      <AccordionTrigger className="bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg">
                        Legal Information for the entity
                      </AccordionTrigger>
                      <AccordionContent className="bg-gray-100 p-4 rounded-lg mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {config.fields.filter((f) => legalInfoFields.includes(f.name)).map((field) => {
                            const value = (data as any)[field.name];
                            if (!value && value !== 0) return null;
                            return (
                              <div key={field.name} className="space-y-1">
                                <Label className="text-sm font-medium text-muted-foreground capitalize underline">
                                  {field.label || field.name.replace(/_/g, ' ')}
                                </Label>
                                <div className="text-sm">
                                  {field.type === "select" ? (
                                    <Badge variant="secondary" className="text-teal-800">{value}</Badge>
                                  ) : field.type === "textarea" ? (
                                    <p className="whitespace-pre-wrap text-teal-800">{value}</p>
                                  ) : field.type === "date" ? (
                                    <span className="text-teal-800">{value ? new Date(value).toLocaleDateString() : '-'}</span>
                                  ) : field.type === "number" ? (
                                    <span className="text-teal-800">{value?.toLocaleString() || '-'}</span>
                                  ) : (
                                    <span className="text-teal-800">{value}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Officer Section */}
                        <div className="mt-8">
                          <div className="font-semibold mb-2">Officers (up to 4)</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {officerFields.map((fields, idx) => {
                              const hasOfficer = fields.some(fname => data[fname]);
                              if (!hasOfficer) return null;
                              return (
                                <div key={idx} className="border rounded p-3 mb-2">
                                  <div className="font-medium mb-1">Officer {idx + 1}</div>
                                  {fields.map((fname) => {
                                    const field = config.fields.find(f => f.name === fname);
                                    if (!field) return null;
                                    const value = data[fname];
                                    if (!value && value !== 0) return null;
                                    return (
                                      <div key={fname} className="space-y-1">
                                        <Label className="text-sm font-medium text-muted-foreground capitalize">
                                          {field.label || field.name.replace(/_/g, ' ')}
                                        </Label>
                                        <div className="text-sm"><span className="text-teal-800">{value}</span></div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {/* Texas-specific fields */}
                        {stateOfFormation === 'Texas' && (
                          <div className="mt-8">
                            <div className="font-semibold mb-2 flex items-center gap-2">Texas-Specific Info
                              <a href="https://security.app.cpa.state.tx.us/Public/create-account" target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">Webfile Portal</a>
                              <a href="https://mycpa.cpa.state.tx.us/coa/search.do" target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">Entity Search</a>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {config.fields.filter((f) => texasFields.includes(f.name)).map((field) => {
                                const value = (data as any)[field.name];
                                if (!value) return null;
                                return (
                                  <div key={field.name} className="space-y-1">
                                    <Label className="text-sm font-medium text-muted-foreground capitalize">
                                      {field.label || field.name.replace(/_/g, ' ')}
                                    </Label>
                                    <div className="text-sm">
                                      {field.type === "select" ? (
                                        <Badge variant="secondary" className="text-teal-800">{value}</Badge>
                                      ) : field.type === "textarea" ? (
                                        <p className="whitespace-pre-wrap text-teal-800">{value}</p>
                                      ) : field.type === "date" ? (
                                        <span className="text-teal-800">{value ? new Date(value).toLocaleDateString() : '-'}</span>
                                      ) : field.type === "number" ? (
                                        <span className="text-teal-800">{value?.toLocaleString() || '-'}</span>
                                      ) : (
                                        <span className="text-teal-800">{value}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </TabsContent>
              
              <TabsContent value="related-data" className="space-y-6">
                {table === 'entities' && (
                  <Suspense fallback={<div className="text-center py-8">Loading relationships...</div>}>
                    <ClientRelationshipTabs entityId={id} />
                  </Suspense>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('DetailPage: Unexpected error', error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Error Loading Page</h1>
          <p className="mb-4">An unexpected error occurred while loading this page.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
} 