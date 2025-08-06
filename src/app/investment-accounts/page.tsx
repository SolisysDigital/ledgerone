import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default async function InvestmentAccountsPage() {
  const { data: investmentAccounts, error } = await supabase
    .from('investment_accounts')
    .select('*')
    .order('provider', { ascending: true });

  if (error) {
    console.error('Error fetching investment accounts:', error);
    return (
      <ClientNavigationWrapper>
        <div>Error loading investment accounts</div>
      </ClientNavigationWrapper>
    );
  }

  return (
    <ClientNavigationWrapper>
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

        <Card>
          <CardHeader>
            <CardTitle>Investment Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {investmentAccounts?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No investment accounts found. Add your first investment account to get started.
              </p>
            ) : (
              <Table>
                <TableHeader className="bg-slate-500">
                  <TableRow>
                    <TableHead className="text-white">Provider</TableHead>
                    <TableHead className="text-white">Account Number</TableHead>
                    <TableHead className="text-white">Account Type</TableHead>
                    <TableHead className="text-white">Balance</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investmentAccounts?.map((account) => (
                    <TableRow key={account.id} className="border-b border-teal-300">
                      <TableCell className="text-teal-800">{account.provider}</TableCell>
                      <TableCell className="text-teal-800">{account.account_number}</TableCell>
                      <TableCell className="text-teal-800">{account.account_type}</TableCell>
                      <TableCell className="text-teal-800">{account.current_balance ? `$${Number(account.current_balance).toLocaleString()}` : '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/investment-accounts/${account.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link href={`/investment-accounts/${account.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientNavigationWrapper>
  );
} 