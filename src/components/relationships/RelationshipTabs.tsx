"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { clientGetEntityRelationships, clientDeleteRelationship } from "@/lib/clientActions";

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

  const loadRelationships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading relationships for entity:', entityId);
      
      const data = await clientGetEntityRelationships(entityId);
      console.log('Relationships loaded:', data);
      
      setRelationships(data || []);
    } catch (error) {
      console.error('Error loading relationships:', error);
      setError('Failed to load relationships. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    if (entityId) {
      loadRelationships();
    }
  }, [loadRelationships, entityId]);

  const handleAddRelationship = (type: string) => {
    router.push(`/entities/${entityId}/relationships/${type}/add`);
  };

  const handleEditRelationship = (relationshipId: string, type: string) => {
    router.push(`/entities/${entityId}/relationships/${type}/${relationshipId}/edit`);
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to remove this relationship?')) return;

    try {
      await clientDeleteRelationship(relationshipId);
      await loadRelationships(); // Reload the relationships
    } catch (error) {
      console.error('Error deleting relationship:', error);
      alert('Error removing relationship. Please try again.');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contacts: 'Contacts',
      emails: 'Emails',
      phones: 'Phones',
      bank_accounts: 'Bank Accounts',
      investment_accounts: 'Investment Accounts',
      crypto_accounts: 'Crypto Accounts',
      credit_cards: 'Credit Cards',
      websites: 'Websites',
      hosting_accounts: 'Hosting Accounts'
    };
    return labels[type] || type;
  };

  const getRelationshipsByType = (type: string) => {
    return relationships.filter(r => r.type_of_record === type);
  };

  const relationshipTypes = [
    'contacts',
    'emails', 
    'phones',
    'bank_accounts',
    'investment_accounts',
    'crypto_accounts',
    'credit_cards',
    'websites',
    'hosting_accounts'
  ];

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
    <div className="space-y-6">
      {relationshipTypes.map((type, index) => {
        const typeRelationships = getRelationshipsByType(type);
        const typeLabel = getTypeLabel(type);
        
        return (
          <div key={type}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{typeLabel}</CardTitle>
                  <Button 
                    onClick={() => handleAddRelationship(type)} 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {typeLabel.slice(0, -1)} Relationship
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {typeRelationships.length > 0 ? (
                  <div className="space-y-3">
                    {typeRelationships.map((relationship) => (
                      <div
                        key={relationship.id}
                        className="flex justify-between items-center p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-teal-800">
                            {relationship.related_data_display_name}
                          </h3>
                          {relationship.relationship_description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {relationship.relationship_description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRelationship(relationship.id, type)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRelationship(relationship.id)}
                            className="text-red-600 hover:text-red-700"
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
                    <p className="text-gray-500 mb-4">No {typeLabel.toLowerCase()} relationships yet</p>
                    <Button 
                      onClick={() => handleAddRelationship(type)} 
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First {typeLabel.slice(0, -1)} Relationship
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add horizontal separator between tables (except for the last one) */}
            {index < relationshipTypes.length - 1 && (
              <div className="border-t border-gray-300 my-6"></div>
            )}
          </div>
        );
      })}
    </div>
  );
} 