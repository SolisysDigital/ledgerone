"use client";

import React from "react";
import { tableConfigs } from "@/lib/tableConfigs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Database Tables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(tableConfigs).map(([tableName, config]) => {
            const Icon = tableIcons[tableName] || Building2;
            const isActive = currentTable === tableName;
            
            return (
              <Button
                key={tableName}
                asChild
                variant={isActive ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Link href={`/${tableName}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">
                    {config.label}
                  </span>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 