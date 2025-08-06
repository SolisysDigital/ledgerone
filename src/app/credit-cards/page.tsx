import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { ClientNavigationWrapper } from "@/components/layout/ClientNavigationWrapper";

export default async function CreditCardsPage() {
  const { data: creditCards, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order('cardholder_name', { ascending: true });

  if (error) {
    console.error('Error fetching credit cards:', error);
    return (
      <ClientNavigationWrapper>
        <div>Error loading credit cards</div>
      </ClientNavigationWrapper>
    );
  }

  return (
    <ClientNavigationWrapper>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Credit Cards</h1>
          <Link href="/credit-cards/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Credit Card
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Credit Cards</CardTitle>
          </CardHeader>
          <CardContent>
            {creditCards?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No credit cards found. Add your first credit card to get started.
              </p>
            ) : (
              <Table>
                <TableHeader className="bg-slate-500">
                  <TableRow>
                    <TableHead className="text-white">Cardholder Name</TableHead>
                    <TableHead className="text-white">Bank</TableHead>
                    <TableHead className="text-white">Last 4 Digits</TableHead>
                    <TableHead className="text-white">Exp Date</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditCards?.map((card) => (
                    <TableRow key={card.id} className="border-b border-teal-300">
                      <TableCell className="text-teal-800">{card.cardholder_name}</TableCell>
                      <TableCell className="text-teal-800">{card.issuing_bank}</TableCell>
                      <TableCell className="text-teal-800">****{card.last_four_digits}</TableCell>
                      <TableCell className="text-teal-800">{card.expiration_date}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/credit-cards/${card.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link href={`/credit-cards/${card.id}/edit`}>
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