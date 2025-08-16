import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import ClientRelationshipTabs from "@/components/relationships/ClientRelationshipTabs";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Users, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

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
    const texasSpecificFields = [
      'texas_taxpayer_number',
      'texas_file_number',
      'texas_webfile_number',
      'texas_webfile_login',
      'texas_webfile_password',
    ];
    const stateOfFormation = data['state_of_formation'];

    console.log('DetailPage: Rendering component');

    // For non-entity pages, use the new design pattern
    if (table !== 'entities') {
      return (
        <ClientNavigationWrapper>
          <div className="max-w-7xl mx-auto space-y-8 p-6">
            {/* Simple Header without box */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                  <Link href={`/${table}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Link>
                </Button>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-foreground">{config.label} Details</h1>
                  <p className="text-sm text-muted-foreground">ID: {id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-teal-400 hover:bg-teal-50">
                  <Link href={`/${table}/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2 text-gray-700 hover:text-teal-700" />
                    Edit
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700">
                  <Link href={`/${table}/${id}/delete`}>
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
                    {config.fields.map((field) => {
                      const value = (data as any)[field.name];
                      if (!value && value !== 0) return null;
                      return (
                        <div key={field.name} className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                          <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                            {field.label || field.name.replace(/_/g, ' ')}
                          </Label>
                          <div className="text-sm">
                            {field.type === "select" ? (
                              <Badge variant="secondary" className="text-teal-800 bg-secondary/50">{value}</Badge>
                            ) : field.type === "textarea" ? (
                              <p className="whitespace-pre-wrap text-teal-800 leading-relaxed">{value}</p>
                            ) : field.type === "date" ? (
                              <span className="text-teal-800 font-medium">{value ? new Date(value).toLocaleDateString() : '-'}</span>
                            ) : field.type === "number" ? (
                              <span className="text-teal-800 font-medium">{value?.toLocaleString() || '-'}</span>
                            ) : (
                              <span className="text-teal-800 font-medium">{value}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
          </div>
        </ClientNavigationWrapper>
      );
    }

    // For entities, use the tabbed structure
    return (
      <ClientNavigationWrapper>
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          {/* Main Header without box */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/${table}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Link>
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Entity Details</h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">ID: {id}</p>
                  {data.name && (
                    <span className="text-lg font-semibold text-white bg-teal-600 px-3 py-1 rounded-lg">
                      {data.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-teal-400 hover:bg-teal-50">
                <Link href={`/${table}/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2 text-gray-700 hover:text-teal-700" />
                  Edit
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700">
                <Link href={`/${table}/${id}/delete`}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs Structure */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="information" className="w-full">
                <TabsList className={`border-b border-gray-200 bg-gray-100 rounded-t-lg h-16 p-2 ${table === 'entities' ? 'grid-cols-2' : 'grid-cols-1'} grid w-full`}>
                  <TabsTrigger value="information" className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:rounded-t-lg data-[state=active]:font-semibold rounded-t-md transition-all duration-300 ease-in-out hover:bg-teal-100 hover:border-teal-400 border-b border-gray-200">
                    <FileText className="h-4 w-4 mr-2" />
                    Information
                  </TabsTrigger>
                  {table === 'entities' && (
                    <TabsTrigger value="relationships" className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:rounded-t-lg data-[state=active]:font-semibold rounded-t-md transition-all duration-300 ease-in-out hover:bg-teal-100 hover:border-teal-400 border-b border-gray-200">
                      <Users className="h-4 w-4 mr-2" />
                      Related Data
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="information" className="p-6 space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {config.fields.filter(field => !legalInfoFields.includes(field.name) && !officerFields.flat().includes(field.name) && !texasSpecificFields.includes(field.name)).map((field) => {
                        const value = (data as any)[field.name];
                        if (!value && value !== 0) return null;
                        return (
                          <div key={field.name} className="bg-muted/10 p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                            <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                              {field.label || field.name.replace(/_/g, ' ')}
                            </Label>
                            <div className="text-sm">
                              {field.type === "select" ? (
                                <Badge variant="secondary" className="text-teal-800 bg-secondary/50">{value}</Badge>
                              ) : field.type === "textarea" ? (
                                <p className="whitespace-pre-wrap text-teal-800 leading-relaxed">{value}</p>
                              ) : field.type === "date" ? (
                                <span className="text-teal-800 font-medium">{value ? new Date(value).toLocaleDateString() : '-'}</span>
                              ) : field.type === "number" ? (
                                <span className="text-teal-800 font-medium">{value?.toLocaleString() || '-'}</span>
                              ) : (
                                <span className="text-teal-800 font-medium">{value}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legal Information */}
                  {legalInfoFields.some(field => (data as any)[field]) && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-semibold">Legal Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {legalInfoFields.map((fieldName) => {
                          const value = (data as any)[fieldName];
                          if (!value && value !== 0) return null;
                          const field = config.fields.find(f => f.name === fieldName);
                          if (!field) return null;
                          return (
                            <div key={fieldName} className="bg-muted/10 p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                              <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                                {field.label || fieldName.replace(/_/g, ' ')}
                              </Label>
                              <div className="text-sm">
                                {fieldName === 'naics_code' ? (
                                  <div className="space-y-2">
                                    <span className="text-teal-800 font-medium">{value}</span>
                                    <div>
                                      <a 
                                        href={`https://www.naics.com/naics-code-description/?code=${value}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                                      >
                                        View NAICS Code Details
                                      </a>
                                    </div>
                                  </div>
                                ) : field && field.type === "select" ? (
                                  <Badge variant="secondary" className="text-teal-800 bg-secondary/50">{value}</Badge>
                                ) : field && field.type === "textarea" ? (
                                  <p className="whitespace-pre-wrap text-teal-800 leading-relaxed">{value}</p>
                                ) : field && field.type === "date" ? (
                                  <span className="text-teal-800 font-medium">{value ? new Date(value).toLocaleDateString() : '-'}</span>
                                ) : field && field.type === "number" ? (
                                  <span className="text-teal-800 font-medium">{value?.toLocaleString() || '-'}</span>
                                ) : (
                                  <span className="text-teal-800 font-medium">{value}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Officers Information */}
                  {officerFields.some(([name]) => (data as any)[name]) && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-semibold">Officers</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {officerFields.map(([nameField, titleField, ownershipField], index) => {
                          const name = (data as any)[nameField];
                          const title = (data as any)[titleField];
                          const ownership = (data as any)[ownershipField];
                          
                          if (!name) return null;

                          return (
                            <div key={index} className="bg-muted/10 p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                Officer {index + 1}
                              </Label>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-xs text-muted-foreground block">Name</span>
                                  <span className="text-sm text-teal-800 font-medium">{name}</span>
                                </div>
                                {title && (
                                  <div>
                                    <span className="text-xs text-muted-foreground block">Title</span>
                                    <span className="text-sm text-teal-800 font-medium">{title}</span>
                                  </div>
                                )}
                                {ownership !== null && ownership !== undefined && (
                                  <div>
                                    <span className="text-xs text-muted-foreground block">Ownership</span>
                                    <span className="text-sm text-teal-800 font-medium">{ownership}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Texas-specific Information */}
                  {stateOfFormation === 'Texas' && texasSpecificFields.some(field => (data as any)[field]) && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-semibold">Texas-Specific Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {texasSpecificFields.map((fieldName) => {
                          const value = (data as any)[fieldName];
                          if (!value && value !== 0) return null;
                          const field = config.fields.find(f => f.name === fieldName);
                          if (!field) return null;

                          const isWebfileField = fieldName.includes('webfile');
                          
                          return (
                            <div key={fieldName} className="bg-muted/10 p-4 border border-border/50 hover:border-border transition-colors" style={{ borderRadius: '0.5rem' }}>
                              <Label className="text-sm font-medium text-muted-foreground capitalize mb-2 block">
                                {field.label || fieldName.replace(/_/g, ' ')}
                              </Label>
                              <div className="text-sm space-y-2">
                                <span className="text-teal-800 font-medium">{value}</span>
                                {isWebfileField && (
                                  <div>
                                    <a 
                                      href="https://mycpa.cpa.state.tx.us/coa/"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                                    >
                                      Texas Webfile Portal
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {table === 'entities' && (
                  <TabsContent value="relationships" className="p-6">
                    <Suspense fallback={<div>Loading relationships...</div>}>
                      <ClientRelationshipTabs entityId={id} />
                    </Suspense>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </ClientNavigationWrapper>
    );
  } catch (error) {
    console.error('DetailPage: Unexpected error', error);
    return (
      <ClientNavigationWrapper>
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto mt-12">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Error Loading Page</h1>
              <p className="text-muted-foreground">An unexpected error occurred while loading this page.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ClientNavigationWrapper>
    );
  }
} 