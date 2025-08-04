"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Relationship {
  id: string;
  related_data_id: string;
  relationship_description: string;
  related_data_display_name: string;
}

interface RelationshipTableProps {
  type: string;
  label: string;
  relationships: Relationship[];
  entityId: string;
  onAddRelationship: () => void;
  onEditRelationship: (relationshipId: string) => void;
  onDeleteRelationship: (relationshipId: string) => void;
}

export default function RelationshipTable({
  type,
  label,
  relationships,
  entityId,
  onAddRelationship,
  onEditRelationship,
  onDeleteRelationship,
}: RelationshipTableProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{label}</CardTitle>
          <Button onClick={onAddRelationship} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add {label.slice(0, -1)} Relationship
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {relationships && relationships.length > 0 ? (
          <div className="space-y-3">
            {relationships.map((relationship) => (
              <div
                key={relationship.id}
                className="flex justify-between items-center p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-teal-800">
                    {relationship.related_data_display_name}
                  </h3>
                  {relationship.relationship_description && (
                    <p className="text-sm text-teal-800 mt-1">
                      {relationship.relationship_description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditRelationship(relationship.id)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteRelationship(relationship.id)}
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
            <p className="text-gray-500 mb-4">No {label.toLowerCase()} relationships yet</p>
            <Button onClick={onAddRelationship} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First {label.slice(0, -1)} Relationship
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 