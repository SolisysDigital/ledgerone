"use client";

import React from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Building2, 
  FileText, 
  Users, 
  Mail, 
  Phone, 
  CreditCard, 
  Globe, 
  Server,
  Bitcoin,
  TrendingUp,
  BarChart3,
  Link as LinkIcon,
  Settings,
  Database,
  Activity
} from "lucide-react";

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

export default function Navigation() {
  const pathname = usePathname();
  const currentTable = pathname.split('/')[1];

  // Filter out legal_information as it's an extension of entities
  const filteredTables = Object.entries(tableConfigs).filter(([tableName]) => 
    tableName !== 'legal_information' && 
    tableName !== 'entity_relationships'
  );

  return (
    <div className="space-y-1">
      {/* Home Link */}
      <Button
        asChild
        variant={pathname === "/home" ? "default" : "ghost"}
        className="w-full justify-start h-auto p-2 text-sm"
      >
        <Link href="/home">
          <Home className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-xs font-medium truncate">
            Home
          </span>
          {pathname === "/home" && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Active
            </Badge>
          )}
        </Link>
      </Button>

      {/* Database Tables */}
      {filteredTables.map(([tableName, config]) => {
        const Icon = tableIcons[tableName] || Building2;
        const isActive = currentTable === tableName;
        
        return (
          <Button
            key={tableName}
            asChild
            variant={isActive ? "default" : "ghost"}
            className="w-full justify-start h-auto p-2 text-sm"
          >
            <Link href={`/${tableName}`}>
              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-xs font-medium truncate">
                {config.label}
              </span>
              {isActive && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Active
                </Badge>
              )}
            </Link>
          </Button>
        );
      })}

      {/* Settings Section */}
      <div className="pt-4">
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Settings
          </h3>
        </div>
        
        {/* Entity Related */}
        <Button
          asChild
          variant={pathname.includes("/entities") ? "default" : "ghost"}
          className="w-full justify-start h-auto p-2 text-sm"
        >
          <Link href="/entities">
            <Database className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-xs font-medium truncate">
              Entity Related
            </span>
            {pathname.includes("/entities") && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Active
              </Badge>
            )}
          </Link>
        </Button>

        {/* Entity Relationships */}
        <Button
          asChild
          variant={pathname.includes("/entity_relationships") ? "default" : "ghost"}
          className="w-full justify-start h-auto p-2 text-sm"
        >
          <Link href="/entity_relationships">
            <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-xs font-medium truncate">
              Entity Relationships
            </span>
            {pathname.includes("/entity_relationships") && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Active
              </Badge>
            )}
          </Link>
        </Button>

        {/* Admin Logs */}
        <Button
          asChild
          variant={pathname.includes("/admin/logs") ? "default" : "ghost"}
          className="w-full justify-start h-auto p-2 text-sm"
        >
          <Link href="/admin/logs">
            <Activity className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-xs font-medium truncate">
              Admin Logs
            </span>
            {pathname.includes("/admin/logs") && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Active
              </Badge>
            )}
          </Link>
        </Button>
      </div>
    </div>
  );
} 