import React from "react";
import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  CreditCard, 
  Globe, 
  Server,
  Bitcoin,
  TrendingUp,
  Plus,
  BarChart3,
  Activity
} from "lucide-react";

export default async function HomePage() {
  // Fetch counts for each table
  const tableCounts: Record<string, number> = {};
  
  for (const tableName of Object.keys(tableConfigs)) {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    tableCounts[tableName] = count || 0;
  }

  const totalRecords = Object.values(tableCounts).reduce((sum, count) => sum + count, 0);
  const totalEntities = tableCounts.entities || 0;

  const stats = [
    {
      title: "Total Records",
      value: totalRecords.toLocaleString(),
      icon: Activity,
      description: "All database records",
      color: "text-blue-600"
    },
    {
      title: "Entities",
      value: totalEntities.toLocaleString(),
      icon: Building2,
      description: "Companies and individuals",
      color: "text-green-600"
    },
    {
      title: "Contacts",
      value: (tableCounts.contacts || 0).toLocaleString(),
      icon: Users,
      description: "Contact persons",
      color: "text-purple-600"
    },
    {
      title: "Financial Accounts",
      value: ((tableCounts.bank_accounts || 0) + (tableCounts.investment_accounts || 0) + (tableCounts.crypto_accounts || 0) + (tableCounts.credit_cards || 0)).toLocaleString(),
      icon: CreditCard,
      description: "Bank, investment, crypto, and credit accounts",
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    { name: "Add Entity", href: "/entities/new", icon: Building2, color: "bg-green-500" },
    { name: "Add Contact", href: "/contacts/new", icon: Users, color: "bg-blue-500" },
    { name: "Add Bank Account", href: "/bank_accounts/new", icon: CreditCard, color: "bg-purple-500" },
    { name: "Add Email", href: "/emails/new", icon: Mail, color: "bg-orange-500" },
  ];

  const recentTables = Object.entries(tableConfigs)
    .filter(([_, config]) => config.label !== "Entity Relationships") // Exclude complex relationship table
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">LedgerOne Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive entity relationship management system
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button key={action.name} asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href={action.href}>
                    <div className={`p-2 rounded-full ${action.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-center">{action.name}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Table Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentTables.map(([tableName, config]) => {
              const count = tableCounts[tableName] || 0;
              const getIcon = (name: string) => {
                switch (name) {
                  case 'entities': return Building2;
                  case 'contacts': return Users;
                  case 'emails': return Mail;
                  case 'phones': return Phone;
                  case 'bank_accounts': return CreditCard;
                  case 'investment_accounts': return TrendingUp;
                  case 'crypto_accounts': return Bitcoin;
                  case 'credit_cards': return CreditCard;
                  case 'websites': return Globe;
                  case 'hosting_accounts': return Server;
                  case 'securities_held': return BarChart3;
                  default: return Activity;
                }
              };
              
              const Icon = getIcon(tableName);
              
              return (
                <Card key={tableName} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">{config.label}</h3>
                          <p className="text-sm text-muted-foreground">{count} records</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/${tableName}`}>
                            View
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/${tableName}/new`}>
                            <Plus className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Database Tables</h4>
              <p className="text-muted-foreground">{Object.keys(tableConfigs).length} configured tables</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Relationships</h4>
              <p className="text-muted-foreground">Complex entity relationships with foreign keys</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">CRUD Operations</Badge>
                <Badge variant="secondary">Search & Filter</Badge>
                <Badge variant="secondary">Relationships</Badge>
                <Badge variant="secondary">Modern UI</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
