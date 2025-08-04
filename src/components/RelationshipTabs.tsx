"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, ExternalLink, Building2, Users, Mail, Phone, CreditCard, Globe, Server, Bitcoin, TrendingUp, BarChart3, FileText } from "lucide-react";
import { tableConfigs } from "@/lib/tableConfigs";

interface RelationshipTabsProps {
  currentTable: string;
  currentId: string;
  relatedData: Record<string, any[]>;
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
};

export default function RelationshipTabs({ currentTable, currentId, relatedData }: RelationshipTabsProps) {
  const config = tableConfigs[currentTable as keyof typeof tableConfigs];
  
  if (!config) return null;

  // Get children relationships
  const children = config.children || [];
  
  // Get parent relationships
  const parent = config.parent;

  return (
    <div className="flex w-full gap-6">
      {/* Vertical TabsList Sidebar */}
      <Tabs defaultValue={children[0]?.table || "parent"} orientation="vertical" className="w-full">
        <div className="flex flex-row w-full">
          <TabsList className="flex flex-col w-56 min-w-[180px] max-w-xs items-stretch mr-6 border-r border-muted-foreground/10 bg-muted/50 p-2 rounded-lg h-fit sticky top-4">
            {parent && (
              <TabsTrigger value="parent" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground justify-start">
                {(() => {
                  const Icon = tableIcons[parent.table] || Building2;
                  return (
                    <>
                      <Icon className="h-3 w-3 mr-2" />
                      {tableConfigs[parent.table]?.label || parent.table}
                    </>
                  );
                })()}
              </TabsTrigger>
            )}
            {children.map((child) => (
              <TabsTrigger key={child.table} value={child.table} className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground justify-start">
                {(() => {
                  const Icon = tableIcons[child.table] || Building2;
                  return (
                    <>
                      <Icon className="h-3 w-3 mr-2" />
                      {tableConfigs[child.table]?.label || child.table}
                    </>
                  );
                })()}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Tab Content */}
          <div className="flex-1 pl-2">
            {parent && (
              <TabsContent value="parent" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        {(() => {
                          const Icon = tableIcons[parent.table] || Building2;
                          return <Icon className="h-4 w-4 mr-2" />;
                        })()}
                        {tableConfigs[parent.table]?.label || parent.table}
                      </div>
                      {relatedData[parent.table]?.[0] && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/${parent.table}/${relatedData[parent.table][0].id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {relatedData[parent.table]?.length > 0 ? (
                      <div className="space-y-2">
                        {relatedData[parent.table].map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium text-sm text-teal-800">{item.name || item[parent.displayField || 'id']}</h4>
                              {item.description && (
                                <p className="text-xs text-teal-800">{item.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">{item.type || 'Related'}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4 text-sm">No related data found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {children.map((child) => (
              <TabsContent key={child.table} value={child.table} className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        {(() => {
                          const Icon = tableIcons[child.table] || Building2;
                          return <Icon className="h-4 w-4 mr-2" />;
                        })()}
                        {tableConfigs[child.table]?.label || child.table}
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/${child.table}/new?fk=${currentId}&fkField=${child.fk}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New
                        </Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {relatedData[child.table]?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedData[child.table].map((item: any) => (
                            <TableRow key={item.id} className="border-b border-slate-200">
                              <TableCell className="text-xs">
                                <div title={`ID: ${item.id}`} className="cursor-help text-teal-800">
                                  {item.name || item[tableConfigs[child.table]?.fields.find(f => f.name === 'name')?.name || 'id']}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge variant="secondary" className="text-xs">
                                  {item.type || 'Related'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                <div className="flex space-x-2">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/${child.table}/${item.id}`}>
                                      <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/${child.table}/${item.id}/edit`}>
                                      <Plus className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-center py-4 text-sm">No related data found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
} 