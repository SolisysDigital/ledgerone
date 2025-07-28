import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default async function PhonesPage() {
  const { data: phones, error } = await supabase
    .from('phones')
    .select('*')
    .order('phone', { ascending: true });

  if (error) {
    console.error('Error fetching phones:', error);
    return <div>Error loading phones</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Phones</h1>
        <Link href="/phones/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Phone
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
                <TableHead>Phone</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones?.map((phone) => (
                <TableRow key={phone.id}>
                  <TableCell className="text-teal-800">{phone.phone}</TableCell>
                  <TableCell className="text-teal-800">{phone.label}</TableCell>
                  <TableCell className="text-teal-800">{phone.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/phones/${phone.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/phones/${phone.id}/edit`}>
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