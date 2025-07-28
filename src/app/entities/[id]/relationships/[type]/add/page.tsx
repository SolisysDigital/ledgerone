"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface AddRelationshipPageProps {
  params: Promise<{ id: string; type: string }>;
}

interface AvailableRecord {
  id: string;
  [key: string]: any;
}

export default function AddRelationshipPage({ params }: AddRelationshipPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string; type: string } | null>(null);
  const [availableRecords, setAvailableRecords] = useState<AvailableRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [relationshipDescription, setRelationshipDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const relationshipTypes = [
    { key: 'contacts', label: 'Contact', icon: '👥' },
    { key: 'emails', label: 'Email', icon: '📧' },
    { key: 'phones', label: 'Phone', icon: '📞' },
    { key: 'bank_accounts', label: 'Bank Account', icon: '🏦' },
    { key: 'investment_accounts', label: 'Investment Account', icon: '📈' },
    { key: 'crypto_accounts', label: 'Crypto Account', icon: '₿' },
    { key: 'credit_cards', label: 'Credit Card', icon: '💳' },
    { key: 'websites', label: 'Website', icon: '🌐' },
    { key: 'hosting_accounts', label: 'Hosting Account', icon: '☁️' }
  ];

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const { id, type } = await params;
        setResolvedParams({ id, type });
        await loadAvailableRecords(id, type);
      } catch (error) {
        console.error('Error resolving params:', error);
        setError('Failed to load page data. Please try again.');
      }
    };

    resolveParams();
  }, [params]);

  const loadAvailableRecords = async (entityId: string, type: string) => {
    try {
      setLoadingRecords(true);
      setError(null);
      
      const response = await fetch(`/api/available-records?type=${type}&entityId=${entityId}`);
      if (!response.ok) {
        throw new Error('Failed to load available records');
      }
      
      const data = await response.json();
      setAvailableRecords(data || []);
    } catch (error) {
      console.error('Error loading available records:', error);
      setError('Failed to load available records. Please try again.');
    } finally {
      setLoadingRecords(false);
    }
  };

  const getTypeInfo = (type: string) => {
    return relationshipTypes.find(t => t.key === type) || { key: type, label: type, icon: '📄' };
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
      
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityId: resolvedParams.id,
          relatedDataId: selectedRecordId,
          typeOfRecord: resolvedParams.type,
          relationshipDescription
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create relationship');
      }
      
      // Redirect back to entity detail page
      router.push(`/entities/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error creating relationship:', error);
      alert('Error creating relationship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!resolvedParams) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const typeInfo = getTypeInfo(resolvedParams.type);
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
        
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{typeInfo.icon}</span>
          <h1 className="text-3xl font-bold">Add {typeInfo.label} Relationship</h1>
        </div>
        <p className="text-gray-600">
          Select an existing {typeInfo.label.toLowerCase()} and describe how it relates to this entity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add {typeInfo.label} Relationship</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="record">Select {typeInfo.label}</Label>
              <Select
                value={selectedRecordId}
                onValueChange={setSelectedRecordId}
                disabled={loadingRecords}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Choose a ${typeInfo.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {loadingRecords ? (
                    <SelectItem value="" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading {typeInfo.label.toLowerCase()}s...
                      </div>
                    </SelectItem>
                  ) : availableRecords.length === 0 ? (
                    <SelectItem value="" disabled>
                      No available {typeInfo.label.toLowerCase()}s found
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
                  All {typeInfo.label.toLowerCase()}s are already related to this entity. 
                  <Link href={`/${resolvedParams.type}/new`} className="text-blue-600 hover:text-blue-800 ml-1">
                    Create a new {typeInfo.label.toLowerCase()}
                  </Link>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Relationship Description</Label>
              <Textarea
                id="description"
                placeholder={`Describe how this ${typeInfo.label.toLowerCase()} relates to the entity (e.g., "Primary Attorney", "Tax Advisor")`}
                value={relationshipDescription}
                onChange={(e) => setRelationshipDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading || !selectedRecordId || loadingRecords}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Relationship'
                )}
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