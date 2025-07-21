"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Users, Mail, Phone, CreditCard, Globe, Server, Bitcoin, TrendingUp, BarChart3, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  table: string;
  id: string;
  displayName: string;
  description?: string;
  icon: React.ComponentType<any>;
}

const tableIcons: Record<string, React.ComponentType<any>> = {
  entities: Building2,
  legal_information: FileText,
  contacts: Users,
  emails: Mail,
  phones: Phone,
  bank_accounts: CreditCard,
  investment_accounts: TrendingUp,
  crypto_accounts: Bitcoin,
  credit_cards: CreditCard,
  websites: Globe,
  hosting_accounts: Server,
  securities_held: BarChart3,
  entity_relationships: LinkIcon,
};

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchAllTables = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    const searchResults: SearchResult[] = [];

    try {
      for (const [tableName, config] of Object.entries(tableConfigs)) {
        // Build search query based on table fields
        const searchableFields = config.fields
          .filter(field => field.type === 'text' || field.type === 'textarea')
          .map(field => field.name);

        if (searchableFields.length === 0) continue;

        // Create OR conditions for all searchable fields
        const searchConditions = searchableFields.map(field => 
          `${field}.ilike.%${query}%`
        ).join(',');

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .or(searchConditions)
          .limit(10);

        if (!error && data) {
          data.forEach((item: any) => {
            const displayName = item.name || item[config.fields[0]?.name] || `ID: ${item.id}`;
            const description = item.description || item[config.fields.find(f => f.name === 'description')?.name || ''];
            
            searchResults.push({
              table: tableName,
              id: item.id,
              displayName,
              description,
              icon: tableIcons[tableName] || Building2,
            });
          });
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchAllTables(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAllTables(searchTerm);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo and Title */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-primary mb-4">LedgerOne</h1>
        <p className="text-xl text-muted-foreground">
          Search across all your entities and relationships
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-2xl mb-8">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for entities, contacts, accounts, relationships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-14 pl-12 pr-4 text-lg border-2 focus:border-primary"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="w-full max-w-4xl">
          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching across all tables...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold mb-4">
                                 Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{searchTerm}&quot;
              </h2>
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <Link
                    key={`${result.table}-${result.id}`}
                    href={`/${result.table}/${result.id}`}
                  >
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Icon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                                                         <div className="flex items-center space-x-3 mb-1">
                               <h3 className="font-medium text-lg truncate cursor-help" title={`ID: ${result.id}`}>{result.displayName}</h3>
                              <Badge variant="outline" className="text-xs">
                                {tableConfigs[result.table]?.label}
                              </Badge>
                            </div>
                            {result.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {result.description}
                              </p>
                            )}
                                                         <p className="text-xs text-muted-foreground mt-1">
                               Hover over name to see ID
                             </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg">
                No results found for &quot;{searchTerm}&quot;
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try searching with different keywords or check your spelling
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!hasSearched && (
        <div className="w-full max-w-4xl mt-8">
          <h2 className="text-lg font-semibold mb-4 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/entities">
                <Building2 className="h-8 w-8" />
                <span>View All Entities</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/entities/new">
                <Building2 className="h-8 w-8" />
                <span>Create New Entity</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/entity_relationships">
                <LinkIcon className="h-8 w-8" />
                <span>Manage Relationships</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 