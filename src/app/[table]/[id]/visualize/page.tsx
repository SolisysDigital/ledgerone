"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Network, ExternalLink } from "lucide-react";
import { tableConfigs } from "@/lib/tableConfigs";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

interface RelationshipNode {
  id: string;
  label: string;
  type: string;
  table: string;
}

interface RelationshipBranch {
  category: string;
  color: string;
  items: RelationshipNode[];
}

interface VisualizationData {
  centralNode: RelationshipNode;
  relationships: RelationshipBranch[];
}

export default function VisualizePage() {
  const params = useParams();
  const router = useRouter();
  const table = Array.isArray(params.table) ? params.table[0] : params.table;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = tableConfigs[table as keyof typeof tableConfigs];

  useEffect(() => {
    const fetchVisualizationData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/relationships/${id}/visualize?table=${table}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch visualization data');
        }

        const visualizationData = await response.json();
        setData(visualizationData);
      } catch (err) {
        console.error('Error fetching visualization data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (table && id) {
      fetchVisualizationData();
    }
  }, [table, id]);

  const handleNodeClick = (node: RelationshipNode) => {
    router.push(`/${node.table}/${node.id}`);
  };

  const handleBack = () => {
    router.push(`/${table}/${id}`);
  };

  if (!config) {
    return (
      <ClientNavigationWrapper>
        <div className="p-6">
          <p className="text-red-600">Table configuration not found</p>
        </div>
      </ClientNavigationWrapper>
    );
  }

  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <Network className="h-8 w-8 text-purple-600" />
                <span>Relationship Visualization</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Visualizing relationships for {config.label.slice(0, -1)} #{id}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading relationships...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visualization */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Central Node Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full bg-teal-500`}></div>
                  <span>Central {config.label.slice(0, -1)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-3 bg-teal-50 border-2 border-teal-200 rounded-lg px-6 py-4">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {data.centralNode.label.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-teal-800">
                        {data.centralNode.label}
                      </h3>
                      <p className="text-sm text-teal-600">
                        {config.label.slice(0, -1)} • ID: {data.centralNode.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Relationship Branches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.relationships.map((branch, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: branch.color }}
                      ></div>
                      <span>{branch.category}</span>
                      <span className="text-sm text-gray-500">({branch.items.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {branch.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleNodeClick(item)}
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: branch.color }}
                            >
                              {item.label.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.type}</p>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {data.relationships.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Relationships Found
                    </h3>
                    <p className="text-gray-600">
                      This {config.label.slice(0, -1).toLowerCase()} doesn&apos;t have any related records yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </ClientNavigationWrapper>
  );
} 