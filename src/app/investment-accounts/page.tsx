import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default async function InvestmentAccountsPage() {
  const { data: investmentAccounts, error } = await supabase
    .from('investment_accounts')
    .select('*')
    .order('provider', { ascending: true });

  if (error) {
    console.error('Error fetching investment accounts:', error);
    return <div>Error loading investment accounts</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Investment Accounts</h1>
        <Link href="/investment-accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Investment Account
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
                <TableHead>Account Number</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentAccounts?.map((account) => (
                <TableRow key={account.id} className="border-b border-slate-200">
                  <TableCell className="text-teal-800">{account.provider}</TableCell>
                  <TableCell className="text-teal-800">{account.account_number}</TableCell>
                  <TableCell className="text-teal-800">{account.account_type}</TableCell>
                  <TableCell className="text-teal-800">{account.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/investment-accounts/${account.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/investment-accounts/${account.id}/edit`}>
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