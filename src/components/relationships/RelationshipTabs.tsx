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
      setLoading(true);
      setError(null);
      
      // For now, we'll use a simple fetch approach
      const response = await fetch(`/api/relationships?entityId=${entityId}`);
      if (!response.ok) {
        throw new Error('Failed to load relationships');
      }
      
      const data = await response.json();
      setRelationships(data || []);
    } catch (error) {
      console.error('Error loading relationships:', error);
      setError('Failed to load relationships. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    loadRelationships();
  }, [loadRelationships]);

  const handleAddRelationship = (type: string) => {
    router.push(`/entities/${entityId}/relationships/${type}/add`);
  };

  const handleEditRelationship = (relationshipId: string, type: string) => {
    router.push(`/entities/${entityId}/relationships/${type}/${relationshipId}/edit`);
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to remove this relationship?')) return;

    try {
      const response = await fetch(`/api/relationships/${relationshipId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete relationship');
      }
      
      await loadRelationships(); // Reload the relationships
    } catch (error) {
      console.error('Error deleting relationship:', error);
      alert('Error removing relationship. Please try again.');
    }
  };

  const getRelationshipsByType = (type: string) => {
    return relationships.filter(r => r.type_of_record === type);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading relationships...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="mb-4">{error}</p>
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