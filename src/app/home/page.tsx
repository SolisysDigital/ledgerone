"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  CreditCard, 
  TrendingUp, 
  Bitcoin, 
  Globe, 
  Server,
  Plus,
  ArrowRight,
  Activity,
  Database,
  Zap
} from "lucide-react";
import { tableConfigs } from "@/lib/tableConfigs";

interface TableStats {
  [key: string]: number;
}

// Icon mapping for each table
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
  entity_relationships: Database,
  entity_related_data: Database,
};

export default function HomePage() {
  const [stats, setStats] = useState<TableStats>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tableNames = Object.keys(tableConfigs);
        const statsPromises = tableNames.map(async (table) => {
          try {
            const response = await fetch(`/api/stats/${table}`);
            if (response.ok) {
              const data = await response.json();
              return { table, count: data.count || 0 };
            }
            return { table, count: 0 };
          } catch (error) {
            console.error(`Error fetching stats for ${table}:`, error);
            return { table, count: 0 };
          }
        });

        const results = await Promise.all(statsPromises);
        const newStats: TableStats = {};
        results.forEach(({ table, count }) => {
          newStats[table] = count;
        });

        setStats(newStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getIcon = (table: string) => {
    const iconMap: { [key: string]: any } = {
      entities: Building2,
      contacts: Users,
      emails: Mail,
      phones: Phone,
      websites: Globe,
      bank_accounts: CreditCard,
      investment_accounts: TrendingUp,
      crypto_accounts: Bitcoin,
      credit_cards: CreditCard,
      hosting_accounts: Server,
      entity_relationships: Activity,
      entity_related_data: Database,
    };
    return iconMap[table] || Database;
  };

  const filteredTables = Object.entries(tableConfigs).filter(([table, config]) =>
    config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LedgerOne</h1>
                <p className="text-gray-600">Comprehensive data management system for entities, contacts, and related information</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {Object.values(stats).reduce((sum, count) => sum + count, 0)}
                  </span>
                  <span className="text-xs text-gray-500">Total Records</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {Object.keys(tableConfigs).length}
                  </span>
                  <span className="text-xs text-gray-500">Data Types</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search data types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map(([table, config]) => {
              const Icon = getIcon(table);
              const count = stats[table] || 0;
              const isLoading = loading;

              return (
                <Card key={table} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-900">
                            {config.label}
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-500">
                            Manage {config.label.toLowerCase()} data
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {isLoading ? (
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          ) : (
                            count
                          )}
                        </div>
                        <div className="text-xs text-gray-500">records</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Button asChild variant="outline" size="sm" className="group-hover:bg-orange-50 transition-colors">
                        <Link href={`/${table}`} className="flex items-center space-x-1">
                          <span>View Records</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <Link href={`/${table}/new`} className="flex items-center space-x-1">
                          <Plus className="h-3 w-3" />
                          <span>Add New</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <span>Entity Management</span>
                  </CardTitle>
                  <CardDescription>
                    Create and manage business entities, people, and organizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="outline" size="sm" className="w-full justify-start">
                      <Link href="/entities/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Entity
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                      <Link href="/entities">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        View All Entities ({stats.entities || 0})
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Contact Information</span>
                  </CardTitle>
                  <CardDescription>
                    Manage contact details, emails, and phone numbers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="outline" size="sm" className="w-full justify-start">
                      <Link href="/contacts/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Contact
                      </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Badge variant="secondary" className="justify-center">
                        <Link href="/emails" className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{stats.emails || 0} Emails</span>
                        </Link>
                      </Badge>
                      <Badge variant="secondary" className="justify-center">
                        <Link href="/phones" className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{stats.phones || 0} Phones</span>
                        </Link>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                    <span>Financial Accounts</span>
                  </CardTitle>
                  <CardDescription>
                    Track bank accounts, investments, and financial assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="outline" size="sm" className="w-full justify-start">
                      <Link href="/bank-accounts/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bank Account
                      </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Badge variant="secondary" className="justify-center">
                        <Link href="/investment-accounts" className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{stats.investment_accounts || 0} Investments</span>
                        </Link>
                      </Badge>
                      <Badge variant="secondary" className="justify-center">
                        <Link href="/crypto-accounts" className="flex items-center space-x-1">
                          <Bitcoin className="h-3 w-3" />
                          <span>{stats.crypto_accounts || 0} Crypto</span>
                        </Link>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 