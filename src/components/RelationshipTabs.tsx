"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { Plus, ExternalLink, Building2, Users, Mail, Phone, CreditCard, Globe, Server, Bitcoin, TrendingUp, BarChart3, FileText, Edit, Trash2 } from "lucide-react";
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
                            <TableRow key={item.id} className="border-b border-teal-300">
                              <TableCell className="text-xs">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div className="cursor-pointer text-teal-800 hover:text-teal-600 transition-colors">
                                      {item.name || item[tableConfigs[child.table]?.fields.find(f => f.name === 'name')?.name || 'id']}
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 p-4 bg-white border-2 border-gray-200 shadow-xl rounded-lg" align="start">
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-teal-600" />
                                        <h4 className="font-semibold">{tableConfigs[child.table]?.label || child.table} Details</h4>
                                      </div>
                                      
                                      {/* ID Row with Horizontal Line */}
                                      <div>
                                        <span className="font-medium text-muted-foreground">ID:</span>
                                        <span className="ml-2 font-mono text-xs">{item.id}</span>
                                      </div>
                                      <hr className="border-gray-200" />
                                      
                                      {/* Entity-Specific Fields */}
                                      <div className="space-y-2 text-sm">
                                        {child.table === 'contacts' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Name:</span>
                                              <span className="ml-2">{item.name || 'Not available'}</span>
                                            </div>
                                            {item.title && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Title:</span>
                                                <span className="ml-2">{item.title}</span>
                                              </div>
                                            )}
                                            <div>
                                              <span className="font-medium text-muted-foreground">Email:</span>
                                              <span className="ml-2">{item.email || 'Not available'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Phone:</span>
                                              <span className="ml-2">{item.phone || 'Not available'}</span>
                                            </div>
                                            {item.short_description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Short Description:</span>
                                                <span className="ml-2">{item.short_description}</span>
                                              </div>
                                            )}
                                            {item.description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Description:</span>
                                                <span className="ml-2">{item.description}</span>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {child.table === 'emails' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Email:</span>
                                              <span className="ml-2">{item.email || item.name || 'Not available'}</span>
                                            </div>
                                            {item.label && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Label:</span>
                                                <span className="ml-2">{item.label}</span>
                                              </div>
                                            )}
                                            {item.short_description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Short Description:</span>
                                                <span className="ml-2">{item.short_description}</span>
                                              </div>
                                            )}
                                            {item.description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Description:</span>
                                                <span className="ml-2">{item.description}</span>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {child.table === 'phones' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Phone:</span>
                                              <span className="ml-2">{item.phone || item.name || 'Not available'}</span>
                                            </div>
                                            {item.label && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Label:</span>
                                                <span className="ml-2">{item.label}</span>
                                              </div>
                                            )}
                                            {item.short_description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Short Description:</span>
                                                <span className="ml-2">{item.short_description}</span>
                                              </div>
                                            )}
                                            {item.description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Description:</span>
                                                <span className="ml-2">{item.description}</span>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {child.table === 'bank_accounts' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Bank Name:</span>
                                              <span className="ml-2">{item.bank_name || item.name || 'Not available'}</span>
                                            </div>
                                            {item.account_number && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Account Number:</span>
                                                <span className="ml-2">{item.account_number}</span>
                                              </div>
                                            )}
                                            {item.institution_held_at && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Institution Held At:</span>
                                                <span className="ml-2">{item.institution_held_at}</span>
                                              </div>
                                            )}
                                            {item.purpose && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Purpose:</span>
                                                <span className="ml-2">{item.purpose}</span>
                                              </div>
                                            )}
                                            {item.short_description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Short Description:</span>
                                                <span className="ml-2">{item.short_description}</span>
                                              </div>
                                            )}
                                            {item.description && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Description:</span>
                                                <span className="ml-2">{item.description}</span>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {child.table === 'investment_accounts' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Provider:</span>
                                              <span className="ml-2">{item.provider || item.name || 'Not available'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Account Type:</span>
                                              <span className="ml-2">{item.account_type || 'Not specified'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Account Number:</span>
                                              <span className="ml-2">{item.account_number || 'Not specified'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Institution Held At:</span>
                                              <span className="ml-2">{item.institution_held_at || 'Not specified'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Purpose:</span>
                                              <span className="ml-2">{item.purpose || 'No purpose specified'}</span>
                                            </div>
                                          </>
                                        )}
                                        {child.table === 'crypto_accounts' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Platform:</span>
                                              <span className="ml-2">{item.platform || item.name || 'Not available'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Institution Held At:</span>
                                              <span className="ml-2">{item.institution_held_at || 'Not specified'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Purpose:</span>
                                              <span className="ml-2">{item.purpose || 'No purpose specified'}</span>
                                            </div>
                                          </>
                                        )}
                                        {child.table === 'credit_cards' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Cardholder Name:</span>
                                              <span className="ml-2">{item.cardholder_name || item.name || 'Not available'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Issuer:</span>
                                              <span className="ml-2">{item.issuer || 'Not specified'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Purpose:</span>
                                              <span className="ml-2">{item.purpose || 'No purpose specified'}</span>
                                            </div>
                                          </>
                                        )}
                                        {child.table === 'websites' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">URL:</span>
                                              <span className="ml-2">{item.url || item.name || 'Not available'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Label:</span>
                                              <span className="ml-2">{item.label || 'No label'}</span>
                                            </div>
                                          </>
                                        )}
                                        {child.table === 'hosting_accounts' && (
                                          <>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Provider:</span>
                                              <span className="ml-2">{item.provider || item.name || 'Not available'}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-muted-foreground">Description:</span>
                                              <span className="ml-2">{item.description || 'No description'}</span>
                                            </div>
                                          </>
                                        )}
                                        {item.description && (
                                          <div>
                                            <span className="font-medium text-muted-foreground">Description:</span>
                                            <span className="ml-2">{item.description}</span>
                                          </div>
                                        )}
                                        {item.type && (
                                          <div>
                                            <span className="font-medium text-muted-foreground">Type:</span>
                                            <span className="ml-2">{item.type}</span>
                                          </div>
                                        )}
                                      </div>
                                      <Button 
                                        asChild 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => window.open(`/${child.table}/${item.id}`, '_blank')}
                                      >
                                        <div className="flex items-center justify-center gap-2">
                                          <ExternalLink className="h-4 w-4" />
                                          View Full Details
                                        </div>
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge variant="secondary" className="text-xs">
                                  {item.type || 'Related'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                <div className="flex space-x-3">
                                  <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150" title="View Details">
                                    <Link href={`/${child.table}/${item.id}`}>
                                      <ExternalLink className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150" title="Edit">
                                    <Link href={`/${child.table}/${item.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button asChild variant="ghost" size="sm" className="hover:bg-muted/30 transition-colors duration-150 text-red-600 hover:text-red-700" title="Delete">
                                    <Link href={`/${child.table}/${item.id}/delete`}>
                                      <Trash2 className="h-4 w-4" />
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