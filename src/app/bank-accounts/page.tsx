import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default async function BankAccountsPage() {
  const { data: bankAccounts, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .order('bank_name', { ascending: true });

  if (error) {
    console.error('Error fetching bank accounts:', error);
    return <div>Error loading bank accounts</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bank Accounts</h1>
        <Link href="/bank-accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Account
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
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts?.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="text-teal-800">{account.bank_name}</TableCell>
                  <TableCell className="text-teal-800">{account.account_number}</TableCell>
                  <TableCell className="text-teal-800">{account.account_type}</TableCell>
                  <TableCell className="text-teal-800">{account.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/bank-accounts/${account.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/bank-accounts/${account.id}/edit`}>
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