"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAvailableRecords, createRelationship } from "@/lib/relationshipActions";

interface AddRelationshipPageProps {
  params: Promise<{ id: string; type: string }>;
}

export default function AddRelationshipPage({ params }: AddRelationshipPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string; type: string } | null>(null);
  const [availableRecords, setAvailableRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [relationshipDescription, setRelationshipDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const { id, type } = await params;
      setResolvedParams({ id, type });
      
      // Load available records
      try {
        setLoadingRecords(true);
        const records = await getAvailableRecords(type, id);
        setAvailableRecords(records || []);
      } catch (error) {
        console.error('Error loading available records:', error);
      } finally {
        setLoadingRecords(false);
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

  const getDisplayField = (type: string) => {
    const displayFields: Record<string, string> = {
      contacts: 'name',
      emails: 'email',
      phones: 'phone',
      bank_accounts: 'bank_name',
      investment_accounts: 'provider',
      crypto_accounts: 'platform',
      credit_cards: 'cardholder_name',
      websites: 'url',
      hosting_accounts: 'provider'
    };
    return displayFields[type] || 'name';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resolvedParams || !selectedRecordId) {
      alert('Please select a record');
      return;
    }

    try {
      setLoading(true);
      await createRelationship(
        resolvedParams.id,
        selectedRecordId,
        resolvedParams.type,
        relationshipDescription
      );
      
      // Redirect back to entity detail page
      router.push(`/entities/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error creating relationship:', error);
      alert('Error creating relationship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!resolvedParams) {
    return <div>Loading...</div>;
  }

  const typeLabel = getTypeLabel(resolvedParams.type);
  const displayField = getDisplayField(resolvedParams.type);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link 
          href={`/entities/${resolvedParams.id}`} 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Entity
        </Link>
        
        <h1 className="text-3xl font-bold">Add {typeLabel} Relationship</h1>
        <p className="text-gray-600 mt-2">
          Select an existing {typeLabel.toLowerCase()} and describe how it relates to this entity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add {typeLabel} Relationship</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="record">Select {typeLabel}</Label>
              <Select
                value={selectedRecordId}
                onValueChange={setSelectedRecordId}
                disabled={loadingRecords}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Choose a ${typeLabel.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {loadingRecords ? (
                    <SelectItem value="" disabled>
                      Loading {typeLabel.toLowerCase()}s...
                    </SelectItem>
                  ) : availableRecords.length === 0 ? (
                    <SelectItem value="" disabled>
                      No available {typeLabel.toLowerCase()}s found
                    </SelectItem>
                  ) : (
                    availableRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record[displayField] || record.name || record.email || 'Unnamed Record'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableRecords.length === 0 && !loadingRecords && (
                <p className="text-sm text-gray-500">
                  All {typeLabel.toLowerCase()}s are already related to this entity. 
                  <Link href={`/${resolvedParams.type}/new`} className="text-blue-600 hover:text-blue-800 ml-1">
                    Create a new {typeLabel.toLowerCase()}
                  </Link>
                </p>
              )}
            </div>

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
                disabled={loading || !selectedRecordId || loadingRecords}
              >
                {loading ? 'Creating...' : 'Create Relationship'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/entities/${resolvedParams.id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 