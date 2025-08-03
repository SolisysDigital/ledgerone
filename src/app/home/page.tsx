"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Users, Mail, Phone, CreditCard, Globe, Server, Bitcoin, TrendingUp, BarChart3, FileText, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  table: string;
  id: string;
  name: string;
  description?: string;
  type?: string;
}

const tableIcons: Record<string, React.ComponentType<any>> = {
  entities: Building2,
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
};

export default async function HomePage() {
  const searchResults: SearchResult[] = [];

  // Search across all tables
  for (const [tableName, config] of Object.entries(tableConfigs)) {
    if (tableName === 'entity_related_data') continue;
    
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .limit(3);

    if (data) {
      data.forEach((item: any) => {
        searchResults.push({
          table: tableName,
          id: item.id,
          name: item.name || item.email || item.phone || item.url || item.account_name || 'Unnamed',
          description: item.description || item.short_description,
          type: item.type,
        });
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            {/* Enhanced Logo and Title */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-2xl">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  LedgerOne
                </h1>
                <p className="text-lg text-muted-foreground font-medium">
                  Data Management System
                </p>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive data management for entities, contacts, and related information. 
              Search across all your data with powerful tools and intuitive navigation.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search across all data..." 
                    className="w-full h-16 pl-12 pr-24 text-lg rounded-xl shadow-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="h-16 px-8 rounded-xl shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Quick Access Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Quick Access</h2>
          <p className="text-muted-foreground text-lg">Navigate to your most important data</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(tableConfigs).slice(0, 6).map(([tableName, config]) => {
            const Icon = tableIcons[tableName] || Building2;
            return (
              <Card key={tableName} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
                <CardContent className="p-6">
                  <Link href={`/${tableName}`} className="block">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                      {config.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your {config.label.toLowerCase()} data
                    </p>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Enhanced Recent Data Section */}
      {searchResults.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Recent Data</h2>
            <p className="text-muted-foreground text-lg">Your most recent entries across all tables</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.slice(0, 6).map((result, index) => {
              const Icon = tableIcons[result.table] || Building2;
              const config = tableConfigs[result.table as keyof typeof tableConfigs];
              
              return (
                <Card key={`${result.table}-${result.id}`} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
                  <CardContent className="p-6">
                    <Link href={`/${result.table}/${result.id}`} className="block">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {config?.label || result.table}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                        {result.name}
                      </h3>
                      {result.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.type && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {result.type}
                        </Badge>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 