"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { tableConfigs, TableConfig } from "@/lib/tableConfigs";

interface RelationshipTabsProps {
  currentTable: string;
  currentId: string;
  relatedData: Record<string, any[]>;
}

export default function RelationshipTabs({ currentTable, currentId, relatedData }: RelationshipTabsProps) {
  const config = tableConfigs[currentTable as keyof typeof tableConfigs];
  
  if (!config) return null;

  // Get children relationships
  const children = config.children || [];
  
  // Get parent relationships
  const parent = config.parent;

  return (
    <Tabs defaultValue={children[0]?.table || "parent"} className="w-full">
      <TabsList className="grid w-full grid-cols-auto-fit">
        {parent && (
          <TabsTrigger value="parent">
            {tableConfigs[parent.table]?.label || parent.table}
          </TabsTrigger>
        )}
        {children.map((child) => (
          <TabsTrigger key={child.table} value={child.table}>
            {tableConfigs[child.table]?.label || child.table}
          </TabsTrigger>
        ))}
      </TabsList>

      {parent && (
        <TabsContent value="parent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {tableConfigs[parent.table]?.label || parent.table}
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
                        <h4 className="font-medium">{item.name || item[parent.displayField || 'id']}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">{item.type || 'Related'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No related data found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {children.map((child) => (
        <TabsContent key={child.table} value={child.table} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {tableConfigs[child.table]?.label || child.table}
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
                      {tableConfigs[child.table]?.fields.map((field) => (
                        <TableHead key={field.name}>
                          {field.name === child.fk ? 'ID' : field.name}
                        </TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedData[child.table].map((item: any) => (
                      <TableRow key={item.id}>
                        {tableConfigs[child.table]?.fields.map((field) => (
                          <TableCell key={field.name}>
                            {field.type === 'fk' && field.refTable === currentTable
                              ? item[`${field.name}_display`] || item[field.name]
                              : item[field.name]}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/${child.table}/${item.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No {tableConfigs[child.table]?.label || child.table} found</p>
                  <Button asChild>
                    <Link href={`/${child.table}/new?fk=${currentId}&fkField=${child.fk}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First {tableConfigs[child.table]?.label || child.table}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
} 