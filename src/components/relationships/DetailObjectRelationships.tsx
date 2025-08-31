"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getApiUrl } from "@/lib/utils";

interface EntityRelationship {
  relationship_id: string;
  entity_id: string;
  type_of_record: string;
  relationship_description?: string;
  created_at: string;
  updated_at: string;
  entity: {
    id: string;
    name: string;
    type: string;
    created_at: string;
    updated_at: string;
  } | null;
}

interface DetailObjectRelationshipsProps {
  detailObjectId: string;
  detailObjectType: string;
}

export default function DetailObjectRelationships({ 
  detailObjectId, 
  detailObjectType 
}: DetailObjectRelationshipsProps) {
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRelationships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiUrl(`/relationships/by-detail-object?detail_object_id=${detailObjectId}&detail_object_type=${detailObjectType}`));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DetailObjectRelationships: API error response:', errorText);
        throw new Error(`Failed to load relationships: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('DetailObjectRelationships: API response data:', responseData);
      
      setRelationships(responseData.relationships || []);
    } catch (error) {
      console.error('DetailObjectRelationships: Error loading relationships:', error);
      setError(`Failed to load relationships: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [detailObjectId, detailObjectType]);

  useEffect(() => {
    console.log('DetailObjectRelationships: useEffect triggered with:', { detailObjectId, detailObjectType });
    loadRelationships();
  }, [detailObjectId, detailObjectType, loadRelationships]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p>Loading entity relationships...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <h3 className="text-lg font-semibold mb-2">Error Loading Relationships</h3>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={() => loadRelationships()} 
          className="px-4 py-2 bg-red-100 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Related Entities</h3>
          <Badge variant="secondary">{relationships.length}</Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => {
            // TODO: Implement add entity relationship functionality
            alert('Add entity relationship functionality coming soon');
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>

      {/* Relationships List */}
      {relationships.length > 0 ? (
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <Card key={relationship.relationship_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link 
                        href={`/entities/${relationship.entity_id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {relationship.entity?.name || 'Unknown Entity'}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {relationship.entity?.type || 'Unknown Type'}
                      </Badge>
                    </div>
                    {relationship.relationship_description && (
                      <p className="text-sm text-muted-foreground">
                        {relationship.relationship_description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Created: {new Date(relationship.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(relationship.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/entities/${relationship.entity_id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Entity
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No entity relationships yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            This {detailObjectType.slice(0, -1)} is not currently associated with any entities.
          </p>
        </div>
      )}
    </div>
  );
}
