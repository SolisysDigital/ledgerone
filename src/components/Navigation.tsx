"use client";

import React from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
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
  Link as LinkIcon
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

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Database Tables</h3>
      {Object.entries(tableConfigs).map(([tableName, config]) => {
        const Icon = tableIcons[tableName] || Building2;
        const isActive = currentTable === tableName;
        
        return (
          <Button
            key={tableName}
            asChild
            variant={isActive ? "default" : "ghost"}
            className="w-full justify-start h-auto p-3"
          >
            <Link href={`/${tableName}`}>
              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
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
    </div>
  );
} 