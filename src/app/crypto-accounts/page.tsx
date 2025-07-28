import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default async function CryptoAccountsPage() {
  const { data: cryptoAccounts, error } = await supabase
    .from('crypto_accounts')
    .select('*')
    .order('platform', { ascending: true });

  if (error) {
    console.error('Error fetching crypto accounts:', error);
    return <div>Error loading crypto accounts</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Crypto Accounts</h1>
        <Link href="/crypto-accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Crypto Account
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
                <TableHead>Platform</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptoAccounts?.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="text-teal-800">{account.platform}</TableCell>
                  <TableCell className="text-teal-800">{account.wallet_address}</TableCell>
                  <TableCell className="text-teal-800">{account.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/crypto-accounts/${account.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/crypto-accounts/${account.id}/edit`}>
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