"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, Edit } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: string;
  typeLabel: string;
  icon: string;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  created_at: string;
  updated_at: string;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export default function SearchResults({ 
  query, 
  results, 
  total, 
  page, 
  limit, 
  hasMore, 
  onLoadMore, 
  isLoading = false 
}: SearchResultsProps) {
  const [groupedResults, setGroupedResults] = useState<Record<string, SearchResult[]>>({});

  useEffect(() => {
    // Group results by type
    const grouped = results.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
    
    setGroupedResults(grouped);
  }, [results]);

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          No results found for "{query}"
        </div>
        <p className="text-gray-400">
          Try searching with different keywords or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Found {total} result{total !== 1 ? 's' : ''} for "{query}"
        </div>
        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </div>

      {/* Results by Type */}
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type} className="space-y-3">
          {/* Type Header */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{typeResults[0].icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {typeResults[0].typeLabel}
            </h3>
            <Badge variant="secondary">{typeResults.length}</Badge>
          </div>

          {/* Results Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {typeResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium line-clamp-2">
                    {highlightText(result.title, query)}
                  </CardTitle>
                  {result.subtitle && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {highlightText(result.subtitle, query)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {result.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {highlightText(result.description, query)}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Updated {formatDate(result.updated_at)}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={result.url}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`${result.url}/edit`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? 'Loading more results...' : 'Load More Results'}
          </Button>
        </div>
      )}
    </div>
  );
}
