"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [tableStats, setTableStats] = useState<TableStats>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats: TableStats = {};
        
        // Fetch stats for each table
        for (const [tableName] of Object.entries(tableConfigs)) {
          const response = await fetch(`/api/stats/${tableName}`);
          if (response.ok) {
            const data = await response.json();
            stats[tableName] = data.count || 0;
          } else {
            stats[tableName] = 0;
          }
        }
        
        setTableStats(stats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const filteredTables = Object.entries(tableConfigs).filter(([key, config]) =>
    config.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRecords = Object.values(tableStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to LedgerOne
            </h1>
            <p className="text-slate-600 mt-2">
              Comprehensive data management system for entities, contacts, and related information
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 animate-pulse-custom">
                {isLoading ? "..." : totalRecords}
              </div>
              <div className="text-xs text-slate-500">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 animate-pulse-custom">
                {Object.keys(tableConfigs).length}
              </div>
              <div className="text-xs text-slate-500">Data Types</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search data types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-animate focus-ring"
          />
        </div>
      </div>

      {/* Data Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-animate">
        {filteredTables.map(([key, config]) => {
          const Icon = tableIcons[key] || Building2;
          const recordCount = tableStats[key] || 0;
          
          return (
            <Card 
              key={key} 
              className="card-animate hover-lift group cursor-pointer border-white/50 bg-white/80 backdrop-blur-sm"
            >
              <Link href={`/${key}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                      {recordCount}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-orange-600 transition-colors duration-300">
                    {config.label}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Manage {config.label.toLowerCase()} data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 btn-animate"
                    >
                      View Records
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-animate hover-lift bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Create New Entity</h3>
                  <p className="text-sm text-slate-600">Add a new business or person</p>
                </div>
              </div>
              <Button className="w-full mt-4 btn-animate" asChild>
                <Link href="/entities/new">
                  Create Entity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-animate hover-lift bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Add Contact</h3>
                  <p className="text-sm text-slate-600">Create a new contact record</p>
                </div>
              </div>
              <Button className="w-full mt-4 btn-animate" asChild>
                <Link href="/contacts/new">
                  Add Contact
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-animate hover-lift bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">View Logs</h3>
                  <p className="text-sm text-slate-600">Check system activity</p>
                </div>
              </div>
              <Button className="w-full mt-4 btn-animate" asChild>
                <Link href="/admin/logs">
                  View Logs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card className="card-animate bg-white/80 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-green-700">Database</div>
              <div className="text-xs text-green-600">Online</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-blue-700">API</div>
              <div className="text-xs text-blue-600">Active</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <Server className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-purple-700">Server</div>
              <div className="text-xs text-purple-600">Running</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
              <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-orange-700">Performance</div>
              <div className="text-xs text-orange-600">Optimal</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 