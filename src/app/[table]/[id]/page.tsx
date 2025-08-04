import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import ClientRelationshipTabs from "@/components/relationships/ClientRelationshipTabs";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Building2, Users, FileText } from "lucide-react";
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
    const texasFields = [
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
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-border/50">
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
              <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/${table}/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow text-destructive hover:text-destructive">
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
                      <div key={field.name} className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors">
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
          </div>
        </div>
      );
    }

    // For entities, use the existing tab-based structure
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-border/50">
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
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/${table}/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow text-destructive hover:text-destructive">
              <Link href={`/${table}/${id}/delete`}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Link>
            </Button>
          </div>
        </div>

        <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
          <CardContent className="p-0">
            <Tabs defaultValue="information" className="w-full">
              <div className="border-b border-border/50 bg-muted/20 rounded-t-lg">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-transparent border-0 gap-1 p-1">
                  <TabsTrigger 
                    value="information" 
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-t-lg transition-all duration-200 hover:bg-white/50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Information
                  </TabsTrigger>
                  <TabsTrigger 
                    value="related-data" 
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-t-lg transition-all duration-200 hover:bg-white/50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Related Data
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="information" className="p-8 space-y-8">
                {/* Enhanced Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.fields.filter((f) => !legalInfoFields.includes(f.name) && !officerFields.flat().includes(f.name) && !texasFields.includes(f.name)).map((field) => {
                      const value = (data as any)[field.name];
                      if (!value && value !== 0) return null;
                      return (
                        <div key={field.name} className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors">
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
                
                {/* Enhanced Legal Info Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-secondary rounded-full"></div>
                    <h3 className="text-lg font-semibold">Legal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.fields.filter((f) => legalInfoFields.includes(f.name)).map((field) => {
                      const value = (data as any)[field.name];
                      if (!value && value !== 0) return null;
                      return (
                        <div key={field.name} className="bg-muted/10 rounded-lg p-4 border border-border/50 hover:border-border transition-colors">
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
                  
                  {/* Enhanced Officers Section */}
                  {officerFields.some(([nameField]) => (data as any)[nameField]) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-accent rounded-full"></div>
                        <h3 className="text-lg font-semibold">Officers (up to 4)</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {officerFields.map(([nameField, titleField, ownershipField]) => {
                          const name = (data as any)[nameField];
                          const title = (data as any)[titleField];
                          const ownership = (data as any)[ownershipField];
                          
                          if (!name) return null;
                          
                          return (
                            <Card key={nameField} className="bg-accent/5 border-accent/20">
                              <CardContent className="p-4 space-y-2">
                                {config.fields.filter((f) => [nameField, titleField, ownershipField].includes(f.name)).map((field) => {
                                  const value = (data as any)[field.name];
                                  if (!value && value !== 0) return null;
                                  return (
                                    <div key={field.name} className="space-y-1">
                                      <Label className="text-xs font-medium text-muted-foreground capitalize">
                                        {field.label || field.name.replace(/_/g, ' ')}
                                      </Label>
                                      <div className="text-sm">
                                        <span className="text-teal-800 font-medium">{value}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Texas-specific fields */}
                  {stateOfFormation === 'Texas' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-warning rounded-full"></div>
                        <h3 className="text-lg font-semibold">Texas-Specific Information</h3>
                        <div className="flex gap-2 ml-auto">
                          <a href="https://security.app.cpa.state.tx.us/Public/create-account" target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600 hover:text-blue-800 transition-colors">Webfile Portal</a>
                          <a href="https://mycpa.cpa.state.tx.us/coa/search.do" target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600 hover:text-blue-800 transition-colors">Entity Search</a>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {config.fields.filter((f) => texasFields.includes(f.name)).map((field) => {
                          const value = (data as any)[field.name];
                          if (!value) return null;
                          return (
                            <div key={field.name} className="bg-warning/5 rounded-lg p-4 border border-warning/20 hover:border-warning/30 transition-colors">
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
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="related-data" className="p-8">
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Loading relationships...</p>
                    </div>
                  </div>
                }>
                  <ClientRelationshipTabs entityId={id} />
                </Suspense>
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
    );
  }
} 