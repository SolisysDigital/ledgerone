"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Building2 } from "lucide-react";
import { DetailsGrid } from "@/components/record/DetailsGrid";
import { getApiUrl } from "@/lib/utils";

interface Website {
  id: string;
  url: string;
  label?: string;
  short_description?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

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

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [website, setWebsite] = useState<Website | null>(null);
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [relationshipsLoading, setRelationshipsLoading] = useState(true);

  const websiteId = params.id as string;

  useEffect(() => {
    if (websiteId) {
      fetchWebsite();
      fetchRelationships();
    }
  }, [websiteId]);

  const fetchWebsite = async () => {
    try {
      const response = await fetch(getApiUrl(`/websites/${websiteId}`));
      if (response.ok) {
        const data = await response.json();
        setWebsite(data);
      } else {
        console.error('Failed to fetch website:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching website:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationships = async () => {
    try {
      const response = await fetch(getApiUrl(`/relationships/by-detail-object?detail_object_id=${websiteId}&detail_object_type=websites`));
      if (response.ok) {
        const data = await response.json();
        setRelationships(data.relationships || []);
      } else {
        console.error('Failed to fetch relationships:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching relationships:', error);
    } finally {
      setRelationshipsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this website?')) {
      try {
        const response = await fetch(getApiUrl(`/websites/${websiteId}`), {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/websites');
        } else {
          console.error('Failed to delete website');
        }
      } catch (error) {
        console.error('Error deleting website:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-6">Loading...</div>
        </main>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex h-screen">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-6">Website not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/websites">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Link>
              </Button>
              <Badge variant="secondary" className="text-sm">
                {website.label || website.url}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/websites/${websiteId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Website Details</h1>
          <p className="text-muted-foreground mb-6">ID: {website.id}</p>

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">URL</label>
                  <p className="mt-1">{website.url}</p>
                </div>
                {website.label && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Label</label>
                    <p className="mt-1">{website.label}</p>
                  </div>
                )}
                {website.short_description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Short Description</label>
                    <p className="mt-1">{website.short_description}</p>
                  </div>
                )}
                {website.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1">{website.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Related Entities</span>
                <Badge variant="secondary">{relationships.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relationshipsLoading ? (
                <div className="text-center py-4">Loading relationships...</div>
              ) : relationships.length > 0 ? (
                <div className="space-y-3">
                  {relationships.map((relationship) => (
                    <div key={relationship.relationship_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/entities/${relationship.entity_id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {relationship.entity?.name || 'Unknown Entity'}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {relationship.entity?.type || 'Unknown Type'}
                          </Badge>
                        </div>
                        {relationship.relationship_description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {relationship.relationship_description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(relationship.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No entity relationships yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This website is not currently associated with any entities.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
