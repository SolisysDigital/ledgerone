"use client";

import React, { useState, useEffect } from "react";
// Remove supabase import - we'll use fetch instead
import { tableConfigs } from "@/lib/tableConfigs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchAllTables = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      for (const [tableName, config] of Object.entries(tableConfigs)) {
        // Build search query based on table fields
        const searchableFields = config.fields
          .filter(field => field.type === 'text' || field.type === 'textarea')
          .map(field => field.name);

        if (searchableFields.length === 0) continue;

        // Use the working API endpoint for search
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/${tableName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
              // Filter data client-side for search
              const filteredData = data.filter((item: any) => {
                return searchableFields.some(field => {
                  const value = item[field];
                  return value && value.toString().toLowerCase().includes(query.toLowerCase());
                });
              }).slice(0, 5); // Limit to 5 results

              filteredData.forEach((item: any) => {
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
        } catch (error) {
          console.error(`Error searching ${tableName}:`, error);
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchAllTables(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-muted-foreground">
          <Search className="h-4 w-4 mr-2" />
          Search across all tables...
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search for entities, contacts, accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          {isSearching && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <Link
                    key={`${result.table}-${result.id}`}
                    href={`/${result.table}/${result.id}`}
                    onClick={() => handleResultClick()}
                  >
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium truncate">{result.displayName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {tableConfigs[result.table]?.label}
                              </Badge>
                            </div>
                            {result.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {!isSearching && searchTerm && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found for &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 