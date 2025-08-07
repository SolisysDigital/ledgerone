import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const RELATIONSHIP_CATEGORIES = {
  entities: ['contacts', 'emails', 'phones', 'websites', 'bank_accounts', 'credit_cards', 'investment_accounts', 'crypto_accounts', 'hosting_accounts'],
  contacts: ['entities'],
  emails: ['entities', 'contacts'],
  phones: ['entities', 'contacts'],
  websites: ['entities'],
  bank_accounts: ['entities'],
  credit_cards: ['entities'],
  investment_accounts: ['entities'],
  crypto_accounts: ['entities'],
  hosting_accounts: ['entities']
};

const NODE_COLORS = {
  entity: '#14b8a6', // teal-500
  contact: '#3b82f6', // blue-500
  email: '#8b5cf6', // purple-500
  phone: '#f97316', // orange-500
  website: '#6366f1', // indigo-500
  bank_account: '#22c55e', // green-500
  credit_card: '#ef4444', // red-500
  investment_account: '#f59e0b', // amber-500
  crypto_account: '#06b6d4', // cyan-500
  hosting_account: '#64748b' // slate-500
};

const TABLE_LABELS = {
  entities: 'Entity',
  contacts: 'Contact',
  emails: 'Email',
  phones: 'Phone',
  websites: 'Website',
  bank_accounts: 'Bank Account',
  credit_cards: 'Credit Card',
  investment_accounts: 'Investment Account',
  crypto_accounts: 'Crypto Account',
  hosting_accounts: 'Hosting Account'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const id = params.id;

    if (!table || !id) {
      return NextResponse.json(
        { error: 'Missing table or id parameter' },
        { status: 400 }
      );
    }

    // Get the central node data
    const { data: centralNode, error: centralError } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (centralError || !centralNode) {
      return NextResponse.json(
        { error: 'Central node not found' },
        { status: 404 }
      );
    }

    // Get the primary field for the label
    const primaryField = getPrimaryField(table, centralNode);
    const centralNodeData = {
      id: centralNode.id,
      label: centralNode[primaryField] || `ID: ${centralNode.id}`,
      type: table,
      table: table
    };

    // Get relationships based on the table type
    const relationships: any[] = [];
    const categories = RELATIONSHIP_CATEGORIES[table as keyof typeof RELATIONSHIP_CATEGORIES] || [];

    for (const relatedTable of categories) {
      try {
        // Query related records
        const { data: relatedRecords, error: relatedError } = await supabase
          .from(relatedTable)
          .select('*')
          .eq(`${table}_id`, id);

        if (!relatedError && relatedRecords && relatedRecords.length > 0) {
          const primaryField = getPrimaryField(relatedTable, relatedRecords[0]);
          
          const items = relatedRecords.map(record => ({
            id: record.id,
            label: record[primaryField] || `ID: ${record.id}`,
            type: relatedTable,
            table: relatedTable
          }));

          relationships.push({
            category: getCategoryLabel(relatedTable),
            color: NODE_COLORS[relatedTable as keyof typeof NODE_COLORS] || '#6b7280',
            items: items
          });
        }
      } catch (error) {
        console.error(`Error fetching ${relatedTable} relationships:`, error);
        // Continue with other relationships even if one fails
      }
    }

    return NextResponse.json({
      centralNode: centralNodeData,
      relationships: relationships
    });

  } catch (error) {
    console.error('Error in visualization API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getPrimaryField(table: string, record: any): string {
  const fieldPriority = {
    entities: ['name', 'entity_name', 'short_description'],
    contacts: ['name', 'first_name', 'last_name', 'contact_name'],
    emails: ['email', 'email_address'],
    phones: ['phone', 'phone_number', 'number'],
    websites: ['url', 'website_url', 'domain'],
    bank_accounts: ['bank_name', 'account_name', 'account_number'],
    credit_cards: ['cardholder_name', 'issuing_bank'],
    investment_accounts: ['provider', 'account_name'],
    crypto_accounts: ['platform', 'account_name'],
    hosting_accounts: ['provider', 'account_name']
  };

  const priorityFields = fieldPriority[table as keyof typeof fieldPriority] || ['id'];
  
  for (const field of priorityFields) {
    if (record[field]) {
      return field;
    }
  }
  
  return 'id';
}

function getCategoryLabel(table: string): string {
  const labels = {
    entities: 'Entities',
    contacts: 'Contacts',
    emails: 'Email Addresses',
    phones: 'Phone Numbers',
    websites: 'Websites',
    bank_accounts: 'Bank Accounts',
    credit_cards: 'Credit Cards',
    investment_accounts: 'Investment Accounts',
    crypto_accounts: 'Crypto Accounts',
    hosting_accounts: 'Hosting Accounts'
  };

  return labels[table as keyof typeof labels] || table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
} 