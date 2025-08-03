"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Relationship {
  id: string;
  related_data_id: string;
  type_of_record: string;
  relationship_description: string;
  related_data_display_name: string;
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
    { key: 'contacts', label: 'Contacts', icon: '👥' },
    { key: 'emails', label: 'Emails', icon: '📧' },
    { key: 'phones', label: 'Phones', icon: '📞' },
    { key: 'bank_accounts', label: 'Bank Accounts', icon: '🏦' },
    { key: 'investment_accounts', label: 'Investment Accounts', icon: '📈' },
    { key: 'crypto_accounts', label: 'Crypto Accounts', icon: '₿' },
    { key: 'credit_cards', label: 'Credit Cards', icon: '💳' },
    { key: 'websites', label: 'Websites', icon: '🌐' },
    { key: 'hosting_accounts', label: 'Hosting Accounts', icon: '☁️' }
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
    try {
      console.log('RelationshipTabs: Adding relationship for type:', type);
      router.push(`/entities/${entityId}/relationships/${type}/add`);
    } catch (error) {
      console.error('RelationshipTabs: Error navigating to add relationship:', error);
      alert('Error navigating to add relationship page');
    }
  };

  const handleEditRelationship = (relationshipId: string, type: string) => {
    try {
      console.log('RelationshipTabs: Editing relationship:', relationshipId, 'for type:', type);
      router.push(`/entities/${entityId}/relationships/${type}/${relationshipId}/edit`);
    } catch (error) {
      console.error('RelationshipTabs: Error navigating to edit relationship:', error);
      alert('Error navigating to edit relationship page');
    }
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      if (!confirm('Are you sure you want to remove this relationship?')) return;

      console.log('RelationshipTabs: Deleting relationship:', relationshipId);
      
      const response = await fetch(`/api/relationships/${relationshipId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete relationship: ${response.status} ${response.statusText}`);
      }
      
      console.log('RelationshipTabs: Relationship deleted successfully');
      await loadRelationships(); // Reload the relationships
    } catch (error) {
      console.error('RelationshipTabs: Error deleting relationship:', error);
      alert(`Error removing relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getRelationshipsByType = (type: string) => {
    return relationships.filter(r => r.type_of_record === type);
  };

  console.log('RelationshipTabs: Rendering component with state:', { loading, error, relationshipsCount: relationships.length });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading relationships...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <h3 className="text-lg font-semibold mb-2">Error Loading Relationships</h3>
            <p className="mb-4 text-sm">{error}</p>
            <Button onClick={loadRelationships} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {relationshipTypes.map((typeInfo, index) => {
        const typeRelationships = getRelationshipsByType(typeInfo.key);
        const hasRelationships = typeRelationships.length > 0;
        
        return (
          <div key={typeInfo.key}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{typeInfo.label}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {typeRelationships.length} relationship{typeRelationships.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAddRelationship(typeInfo.key)} 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {typeInfo.label.slice(0, -1)}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {hasRelationships ? (
                  <div className="space-y-3">
                    {typeRelationships.map((relationship) => (
                      <div
                        key={relationship.id}
                        className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-teal-800">
                              {relationship.related_data_display_name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {typeInfo.label.slice(0, -1)}
                            </Badge>
                          </div>
                          {relationship.relationship_description && (
                            <p className="text-sm text-gray-600">
                              {relationship.relationship_description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRelationship(relationship.id, typeInfo.key)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRelationship(relationship.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">{typeInfo.icon}</div>
                    <p className="text-gray-500 mb-4">No {typeInfo.label.toLowerCase()} relationships yet</p>
                    <Button 
                      onClick={() => handleAddRelationship(typeInfo.key)} 
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100"
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
              <Separator className="my-6" />
            )}
          </div>
        );
      })}
    </div>
  );
} 