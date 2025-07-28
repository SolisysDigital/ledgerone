import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default async function WebsitesPage() {
  const { data: websites, error } = await supabase
    .from('websites')
    .select('*')
    .order('url', { ascending: true });

  if (error) {
    console.error('Error fetching websites:', error);
    return <div>Error loading websites</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Websites</h1>
        <Link href="/websites/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Website
          </Button>
        </Link>
      </div>

      <Card className="bg-gray-50 rounded-lg p-4">
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites?.map((website) => (
                <TableRow key={website.id}>
                  <TableCell className="text-teal-800">{website.url}</TableCell>
                  <TableCell className="text-teal-800">{website.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/websites/${website.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/websites/${website.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 