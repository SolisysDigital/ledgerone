"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Users, Mail, Phone, CreditCard, TrendingUp, Bitcoin, Globe, Server, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Relationship {
  id: string;
  related_data_id: string;
  type_of_record: string;
  relationship_description: string;
  related_data_display_name: string;
  email?: string;
  phone?: string;
  email_address?: string;
  description?: string;
  phone_number?: string;
  label?: string;
  bank_name?: string;
  purpose?: string;
}

interface RelationshipTabsProps {
  entityId: string;
}

export default function RelationshipTabs({ entityId }: RelationshipTabsProps) {
  const router = useRouter();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const relationshipTypes = [
    { key: 'contacts', label: 'Contacts', icon: Users, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { key: 'emails', label: 'Emails', icon: Mail, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { key: 'phones', label: 'Phones', icon: Phone, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
    { key: 'bank_accounts', label: 'Bank Accounts', icon: CreditCard, color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
    { key: 'investment_accounts', label: 'Investment Accounts', icon: TrendingUp, color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
    { key: 'crypto_accounts', label: 'Crypto Accounts', icon: Bitcoin, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { key: 'credit_cards', label: 'Credit Cards', icon: CreditCard, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    { key: 'websites', label: 'Websites', icon: Globe, color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
    { key: 'hosting_accounts', label: 'Hosting Accounts', icon: Server, color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' }
  ];

  const loadRelationships = useCallback(async () => {
    try {
      console.log('RelationshipTabs: Starting to load relationships for entityId:', entityId);
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = fetch(`/api/relationships?entityId=${entityId}`);
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      console.log('RelationshipTabs: Fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('RelationshipTabs: API error response:', errorText);
        throw new Error(`Failed to load relationships: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('RelationshipTabs: Relationships loaded successfully:', data);
      
      setRelationships(data || []);
    } catch (error) {
      console.error('RelationshipTabs: Error loading relationships:', error);
      setError(`Failed to load relationships: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    console.log('RelationshipTabs: useEffect triggered with entityId:', entityId);
    
    // Add error boundary for React errors
    const handleError = (error: ErrorEvent) => {
      console.error('RelationshipTabs: React error caught:', error);
      setError(`React Error: ${error.message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('RelationshipTabs: Unhandled promise rejection:', event.reason);
      setError(`Promise Rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Load relationships
    loadRelationships();

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [loadRelationships]);

  const handleAddRelationship = (type: string) => {
    router.push(`/entities/${entityId}/relationships/${type}/add`);
  };

  const handleEditRelationship = (relationshipId: string, type: string) => {
    router.push(`/entities/${entityId}/relationships/${type}/${relationshipId}/edit`);
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      console.log('RelationshipTabs: Deleting relationship:', relationshipId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = fetch(`/api/relationships/${relationshipId}`, {
        method: 'DELETE',
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        throw new Error(`Failed to delete relationship: ${response.status}`);
      }
      
      console.log('RelationshipTabs: Relationship deleted successfully');
      setRelationships(prev => prev.filter(r => r.id !== relationshipId));
    } catch (error) {
      console.error('RelationshipTabs: Error deleting relationship:', error);
      setError(`Failed to delete relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getRelationshipsByType = (type: string) => {
    return relationships.filter(r => r.type_of_record === type);
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h3 className="text-lg font-semibold text-foreground">Loading Relationships</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Error Loading Relationships</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
          <Button onClick={loadRelationships} variant="outline" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {relationshipTypes.map((typeInfo, index) => {
        const typeRelationships = getRelationshipsByType(typeInfo.key);
        const hasRelationships = typeRelationships.length > 0;
        const Icon = typeInfo.icon;
        
        return (
          <div key={typeInfo.key}>
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95 overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${typeInfo.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${typeInfo.textColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        {typeInfo.label}
                        <Badge variant="secondary" className={`${typeInfo.bgColor} ${typeInfo.textColor}`}>
                          {typeRelationships.length}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {typeRelationships.length} relationship{typeRelationships.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAddRelationship(typeInfo.key)} 
                    size="sm"
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {typeInfo.label.slice(0, -1)}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {hasRelationships ? (
                  <div className="overflow-hidden">
                    <Table className="table-modern">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">Name</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">Type</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">Relationship</TableHead>
                          <TableHead className="font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeRelationships.map((relationship) => (
                          <TableRow key={relationship.id} className="hover:bg-muted/30 transition-colors duration-150 border-b border-teal-300">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${typeInfo.bgColor} rounded-lg flex items-center justify-center`}>
                                  <Icon className={`h-4 w-4 ${typeInfo.textColor}`} />
                                </div>
                                <div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <div className="font-semibold text-foreground cursor-pointer hover:text-teal-600 transition-colors">
                                        {relationship.related_data_display_name}
                                      </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4 bg-white border-2 border-gray-200 shadow-xl rounded-lg" align="start">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Icon className={`h-4 w-4 ${typeInfo.textColor}`} />
                                          <h4 className="font-semibold">{typeInfo.label.slice(0, -1)} Details</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="font-medium text-muted-foreground">Name:</span>
                                            <span className="ml-2">{relationship.related_data_display_name}</span>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">ID:</span>
                                            <span className="ml-2 font-mono text-xs">{relationship.related_data_id}</span>
                                          </div>
                                          {typeInfo.key === 'contacts' && (
                                            <>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Email:</span>
                                                <span className="ml-2">{relationship.email || 'Not available'}</span>
                                              </div>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Phone:</span>
                                                <span className="ml-2">{relationship.phone || 'Not available'}</span>
                                              </div>
                                            </>
                                          )}
                                          {typeInfo.key === 'emails' && (
                                            <>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Email:</span>
                                                <span className="ml-2">{relationship.email_address || relationship.related_data_display_name}</span>
                                              </div>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Description:</span>
                                                <span className="ml-2">{relationship.description || 'No description'}</span>
                                              </div>
                                            </>
                                          )}
                                          {typeInfo.key === 'phones' && (
                                            <>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Phone:</span>
                                                <span className="ml-2">{relationship.phone_number || relationship.related_data_display_name}</span>
                                              </div>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Label:</span>
                                                <span className="ml-2">{relationship.label || 'No label'}</span>
                                              </div>
                                            </>
                                          )}
                                          {typeInfo.key === 'bank_accounts' && (
                                            <>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Bank Name:</span>
                                                <span className="ml-2">{relationship.bank_name || relationship.related_data_display_name}</span>
                                              </div>
                                              <div>
                                                <span className="font-medium text-muted-foreground">Purpose:</span>
                                                <span className="ml-2">{relationship.purpose || 'No purpose specified'}</span>
                                              </div>
                                            </>
                                          )}
                                          {relationship.relationship_description && (
                                            <div>
                                              <span className="font-medium text-muted-foreground">Relationship:</span>
                                              <span className="ml-2">{relationship.relationship_description}</span>
                                            </div>
                                          )}
                                        </div>
                                        <Button 
                                          asChild 
                                          size="sm" 
                                          className="w-full"
                                          onClick={() => window.open(`/${typeInfo.key}/${relationship.related_data_id}`, '_blank')}
                                        >
                                          <div className="flex items-center justify-center gap-2">
                                            <ExternalLink className="h-4 w-4" />
                                            View Full Details
                                          </div>
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <div className="text-xs text-muted-foreground">
                                    ID: {relationship.related_data_id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="secondary" className={`${typeInfo.bgColor} ${typeInfo.textColor}`}>
                                {typeInfo.label.slice(0, -1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="max-w-xs">
                                {relationship.relationship_description ? (
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {relationship.relationship_description}
                                  </p>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No description</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditRelationship(relationship.id, typeInfo.key)}
                                  className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-teal-400 hover:bg-teal-50"
                                  title="Edit Relationship"
                                >
                                  <Edit className="w-5 h-5 text-gray-700 hover:text-teal-700" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteRelationship(relationship.id)}
                                  className="shadow-sm hover:shadow-md transition-all duration-200 p-2.5 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700"
                                  title="Remove Relationship"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <div className={`w-20 h-20 ${typeInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <Icon className={`h-10 w-10 ${typeInfo.textColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No {typeInfo.label.toLowerCase()} relationships yet
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Get started by adding your first {typeInfo.label.slice(0, -1).toLowerCase()} relationship to this entity.
                    </p>
                    <Button 
                      onClick={() => handleAddRelationship(typeInfo.key)} 
                      variant="outline"
                      className={`${typeInfo.bgColor} ${typeInfo.textColor} hover:${typeInfo.bgColor} shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First {typeInfo.label.slice(0, -1)}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add separator between sections (except for the last one) */}
            {index < relationshipTypes.length - 1 && (
              <Separator className="my-8" />
            )}
          </div>
        );
      })}
    </div>
  );
} 