"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRelationship, updateRelationship, deleteRelationship } from "@/lib/relationshipActions";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

interface EditRelationshipPageProps {
  params: Promise<{ id: string; type: string; relationshipId: string }>;
}

export default function EditRelationshipPage({ params }: EditRelationshipPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string; type: string; relationshipId: string } | null>(null);
  const [relationship, setRelationship] = useState<any>(null);
  const [relationshipDescription, setRelationshipDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingRelationship, setLoadingRelationship] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const { id, type, relationshipId } = await params;
      setResolvedParams({ id, type, relationshipId });
      
      // Load relationship data
      try {
        setLoadingRelationship(true);
        const relationshipData = await getRelationship(relationshipId);
        setRelationship(relationshipData);
        setRelationshipDescription(relationshipData?.relationship_description || "");
      } catch (error) {
        console.error('Error loading relationship:', error);
      } finally {
        setLoadingRelationship(false);
      }
    };

    resolveParams();
  }, [params]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contacts: 'Contact',
      emails: 'Email',
      phones: 'Phone',
      bank_accounts: 'Bank Account',
      investment_accounts: 'Investment Account',
      crypto_accounts: 'Crypto Account',
      credit_cards: 'Credit Card',
      websites: 'Website',
      hosting_accounts: 'Hosting Account'
    };
    return labels[type] || type;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resolvedParams) return;

    try {
      setLoading(true);
      await updateRelationship(resolvedParams.relationshipId, relationshipDescription);
      
      // Redirect back to entity detail page
      router.push(`/entities/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error updating relationship:', error);
      alert('Error updating relationship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resolvedParams || !confirm('Are you sure you want to remove this relationship?')) return;

    try {
      setLoading(true);
      await deleteRelationship(resolvedParams.relationshipId);
      
      // Redirect back to entity detail page
      router.push(`/entities/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error deleting relationship:', error);
      alert('Error deleting relationship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!resolvedParams || loadingRelationship) {
    return (
      <ClientNavigationWrapper>
        <div>Loading...</div>
      </ClientNavigationWrapper>
    );
  }

  if (!relationship) {
    return (
      <ClientNavigationWrapper>
        <div>Relationship not found</div>
      </ClientNavigationWrapper>
    );
  }

  const typeLabel = getTypeLabel(resolvedParams.type);

  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link 
            href={`/entities/${resolvedParams.id}`} 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Entity
          </Link>
          
          <h1 className="text-3xl font-bold">Edit {typeLabel} Relationship</h1>
          <p className="text-gray-600 mt-2">
            Update the relationship description for this {typeLabel.toLowerCase()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit {typeLabel} Relationship</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Relationship Description</Label>
                <Textarea
                  id="description"
                  placeholder={`Describe how this ${typeLabel.toLowerCase()} relates to the entity (e.g., "Primary Attorney", "Tax Advisor")`}
                  value={relationshipDescription}
                  onChange={(e) => setRelationshipDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Relationship'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/entities/${resolvedParams.id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Removing...' : 'Remove Relationship'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
} 