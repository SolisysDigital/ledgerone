import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default async function CreditCardsPage() {
  const { data: creditCards, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order('cardholder_name', { ascending: true });

  if (error) {
    console.error('Error fetching credit cards:', error);
    return <div>Error loading credit cards</div>;
  }

  return (
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

      <Card className="bg-gray-50 rounded-lg p-4">
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cardholder Name</TableHead>
                <TableHead>Card Number</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditCards?.map((card) => (
                <TableRow key={card.id} className="border-b border-teal-300">
                  <TableCell className="text-teal-800">{card.cardholder_name}</TableCell>
                  <TableCell className="text-teal-800">{card.card_number}</TableCell>
                  <TableCell className="text-teal-800">{card.expiry_date}</TableCell>
                  <TableCell className="text-teal-800">{card.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/credit-cards/${card.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/credit-cards/${card.id}/edit`}>
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