"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  CreditCard, 
  TrendingUp, 
  BarChart3, 
  Bitcoin, 
  Globe, 
  Server, 
  FileText, 
  Activity, 
  Settings, 
  Database,
  Zap,
  Link as LinkIcon
} from "lucide-react";

const tableConfigs = {
  entities: { label: "Entities", icon: Building2 },
  contacts: { label: "Contacts", icon: Users },
  emails: { label: "Emails", icon: Mail },
  phones: { label: "Phones", icon: Phone },
  bank_accounts: { label: "Bank Accounts", icon: CreditCard },
  investment_accounts: { label: "Investment Accounts", icon: TrendingUp },
  crypto_accounts: { label: "Crypto Accounts", icon: Bitcoin },
  credit_cards: { label: "Credit Cards", icon: CreditCard },
  websites: { label: "Websites", icon: Globe },
  hosting_accounts: { label: "Hosting Accounts", icon: Server },
  entity_relationships: { label: "Entity Relationships", icon: LinkIcon },
};

export default function Navigation() {
  const pathname = usePathname();

  // Filter out entity_relationships from main navigation
  const filteredTables = Object.entries(tableConfigs).filter(
    ([key]) => key !== "entity_relationships"
  );

  return (
    <nav className="w-64 bg-white/80 backdrop-blur-md border-r border-white/20 h-screen overflow-y-auto shadow-xl">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-white/30 bg-gradient-to-r from-white/40 to-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LedgerOne
            </h1>
            <p className="text-xs text-slate-600">Data Management</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-4 space-y-2">
        {/* Home */}
        <Button
          asChild
          variant={pathname === "/" ? "default" : "ghost"}
          className={`w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 ${
            pathname === "/"
              ? "bg-blue-600 text-white shadow-md"
              : "hover:bg-white/60 hover:shadow-sm text-slate-700"
          }`}
        >
          <Link href="/">
            <Home className="h-5 w-5 mr-3" />
            <span className="font-medium">Home</span>
            {pathname === "/" && (
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                Active
              </Badge>
            )}
          </Link>
        </Button>

        {/* Data Tables */}
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Data Management
            </h3>
          </div>
          
          {filteredTables.map(([key, config]) => {
            const Icon = config.icon;
            const isActive = pathname === `/${key}`;
            
            return (
              <Button
                key={key}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-11 px-4 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-white/60 hover:shadow-sm text-slate-700"
                }`}
              >
                <Link href={`/${key}`}>
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="font-medium">{config.label}</span>
                  {isActive && (
                    <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                      Active
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="pt-4 space-y-1">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <Settings className="h-3 w-3" />
              Settings
            </h3>
          </div>
          
          {/* Entity Relationships */}
          <Button
            asChild
            variant={pathname === "/entity_relationships" ? "default" : "ghost"}
            className={`w-full justify-start h-11 px-4 rounded-lg transition-all duration-200 ${
              pathname === "/entity_relationships"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-white/60 hover:shadow-sm text-slate-700"
            }`}
          >
            <Link href="/entity_relationships">
              <LinkIcon className="h-4 w-4 mr-3" />
              <span className="font-medium">Entity Relationships</span>
              {pathname === "/entity_relationships" && (
                <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                  Active
                </Badge>
              )}
            </Link>
          </Button>

          {/* Admin Logs */}
          <Button
            asChild
            variant={pathname === "/admin/logs" ? "default" : "ghost"}
            className={`w-full justify-start h-11 px-4 rounded-lg transition-all duration-200 ${
              pathname === "/admin/logs"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-white/60 hover:shadow-sm text-slate-700"
            }`}
          >
            <Link href="/admin/logs">
              <Zap className="h-4 w-4 mr-3" />
              <span className="font-medium">Admin Logs</span>
              {pathname === "/admin/logs" && (
                <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                  Active
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/30 bg-gradient-to-r from-white/40 to-white/20">
        <div className="text-center">
          <p className="text-xs text-slate-600">
            LedgerOne v1.0
          </p>
          <p className="text-xs text-slate-500">
            Data Management System
          </p>
        </div>
      </div>
    </nav>
  );
} 