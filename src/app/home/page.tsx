"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Users, Mail, Phone, CreditCard, Globe, Server, Bitcoin, TrendingUp, BarChart3, FileText, Sparkles } from "lucide-react";
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
  entity_relationships: FileText,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Enhanced Logo and Title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LedgerOne
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Search across all your entities and relationships with our powerful unified search
          </p>
        </div>

        {/* Enhanced Search Box */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for entities, contacts, accounts, relationships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-16 pl-16 pr-24 text-lg border-2 focus:border-primary rounded-xl shadow-lg bg-card/50 backdrop-blur-sm"
              />
              <Button 
                type="submit" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-12 px-6 shadow-md hover:shadow-lg transition-shadow"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Enhanced Search Results */}
        {hasSearched && (
          <div className="w-full max-w-5xl mx-auto">
            {isSearching ? (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Searching across all tables...</h3>
                  <p className="text-muted-foreground">Please wait while we find your results</p>
                </CardContent>
              </Card>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{searchTerm}&quot;
                  </h2>
                </div>
                <div className="grid gap-4">
                  {results.map((result) => {
                    const Icon = result.icon;
                    return (
                      <Link
                        key={`${result.table}-${result.id}`}
                        href={`/${result.table}/${result.id}`}
                      >
                        <Card className="shadow-md hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border bg-gradient-to-r from-card to-card/95 group">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-6">
                              <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-4 mb-2">
                                  <h3 className="font-semibold text-lg truncate cursor-help group-hover:text-primary transition-colors" title={`ID: ${result.id}`}>
                                    {result.displayName}
                                  </h3>
                                  <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground">
                                    {tableConfigs[result.table]?.label}
                                  </Badge>
                                </div>
                                {result.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {result.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2 opacity-75">
                                  Hover over name to see ID • Click to view details
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No results found for &quot;{searchTerm}&quot;
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Try searching with different keywords or check your spelling. You can search for entity names, contact information, account details, and more.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 