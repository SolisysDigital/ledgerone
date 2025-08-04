import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default async function HostingAccountsPage() {
  const { data: hostingAccounts, error } = await supabase
    .from('hosting_accounts')
    .select('*')
    .order('provider', { ascending: true });

  if (error) {
    console.error('Error fetching hosting accounts:', error);
    return <div>Error loading hosting accounts</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hosting Accounts</h1>
        <Link href="/hosting-accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Hosting Account
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
                <TableHead>Provider</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostingAccounts?.map((account) => (
                <TableRow key={account.id} className="border-b border-teal-300">
                  <TableCell className="text-teal-800">{account.provider}</TableCell>
                  <TableCell className="text-teal-800">{account.account_id}</TableCell>
                  <TableCell className="text-teal-800">{account.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/hosting-accounts/${account.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/hosting-accounts/${account.id}/edit`}>
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