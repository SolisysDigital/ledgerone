import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { tableConfigs } from '@/lib/tableConfigs';

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
  hosting_account: '#64748b', // slate-500
  securities_held: '#f97316', // orange-500
  entity_related_data: '#8b5cf6', // purple-500
  entity_relationships: '#06b6d4' // cyan-500
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const resolvedParams = await params;
    const id = resolvedParams.id;

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

    // Get relationships based on the table configuration
    const relationships: any[] = [];
    const config = tableConfigs[table as keyof typeof tableConfigs];

    if (config) {
      // 1. Get children relationships (direct foreign key relationships)
      if (config.children) {
        for (const child of config.children) {
          try {
            const { data: childRecords, error: childError } = await supabase
              .from(child.table)
              .select('*')
              .eq(child.fk, id);

            if (!childError && childRecords && childRecords.length > 0) {
              const primaryField = getPrimaryField(child.table, childRecords[0]);
              
              const items = childRecords.map(record => ({
                id: record.id,
                label: record[primaryField] || `ID: ${record.id}`,
                type: child.table,
                table: child.table
              }));

              relationships.push({
                category: getCategoryLabel(child.table),
                color: NODE_COLORS[child.table as keyof typeof NODE_COLORS] || '#6b7280',
                items: items
              });
            }
          } catch (error) {
            console.error(`Error fetching ${child.table} relationships:`, error);
          }
        }
      }

      // 2. Get parent relationships (if this table has a parent)
      if (config.parent) {
        try {
          const { data: parentRecords, error: parentError } = await supabase
            .from(config.parent.table)
            .select('*')
            .eq('id', centralNode[config.parent.fk]);

          if (!parentError && parentRecords && parentRecords.length > 0) {
            const primaryField = getPrimaryField(config.parent.table, parentRecords[0]);
            
            const items = parentRecords.map(record => ({
              id: record.id,
              label: record[primaryField] || `ID: ${record.id}`,
              type: config.parent!.table,
              table: config.parent!.table
            }));

            relationships.push({
              category: getCategoryLabel(config.parent.table),
              color: NODE_COLORS[config.parent.table as keyof typeof NODE_COLORS] || '#6b7280',
              items: items
            });
          }
        } catch (error) {
          console.error(`Error fetching ${config.parent.table} relationships:`, error);
        }
      }
    }

    // 3. Get entity_related_data relationships (many-to-many relationships)
    if (table === 'entities') {
      try {
        const { data: relatedDataRecords, error: relatedDataError } = await supabase
          .from('entity_related_data')
          .select('*')
          .eq('entity_id', id);

        if (!relatedDataError && relatedDataRecords && relatedDataRecords.length > 0) {
          // Group by type_of_record
          const groupedRecords: Record<string, any[]> = {};
          
          for (const record of relatedDataRecords) {
            const recordType = record.type_of_record;
            if (!groupedRecords[recordType]) {
              groupedRecords[recordType] = [];
            }
            groupedRecords[recordType].push(record);
          }

          // Create relationship branches for each type
          for (const [recordType, records] of Object.entries(groupedRecords)) {
            try {
              // Fetch the actual related records
              const { data: actualRecords, error: actualError } = await supabase
                .from(recordType)
                .select('*')
                .in('id', records.map(r => r.related_data_id));

              if (!actualError && actualRecords && actualRecords.length > 0) {
                const primaryField = getPrimaryField(recordType, actualRecords[0]);
                
                const items = actualRecords.map(record => ({
                  id: record.id,
                  label: record[primaryField] || `ID: ${record.id}`,
                  type: recordType,
                  table: recordType
                }));

                relationships.push({
                  category: getCategoryLabel(recordType),
                  color: NODE_COLORS[recordType as keyof typeof NODE_COLORS] || '#6b7280',
                  items: items
                });
              }
            } catch (error) {
              console.error(`Error fetching ${recordType} records:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching entity_related_data relationships:', error);
      }
    }

    // 4. Get entity_relationships (entity-to-entity relationships)
    if (table === 'entities') {
      try {
        // Get relationships where this entity is the source
        const { data: fromRelationships, error: fromError } = await supabase
          .from('entity_relationships')
          .select('*')
          .eq('from_entity_id', id);

        // Get relationships where this entity is the target
        const { data: toRelationships, error: toError } = await supabase
          .from('entity_relationships')
          .select('*')
          .eq('to_entity_id', id);

        const allRelationships = [...(fromRelationships || []), ...(toRelationships || [])];

        if (allRelationships.length > 0) {
          // Get the related entity IDs
          const relatedEntityIds = allRelationships.map(r => 
            r.from_entity_id === id ? r.to_entity_id : r.from_entity_id
          );

          // Fetch the actual entity records
          const { data: relatedEntities, error: entitiesError } = await supabase
            .from('entities')
            .select('*')
            .in('id', relatedEntityIds);

          if (!entitiesError && relatedEntities && relatedEntities.length > 0) {
            const items = relatedEntities.map(entity => ({
              id: entity.id,
              label: entity.name || `ID: ${entity.id}`,
              type: 'entity',
              table: 'entities'
            }));

            relationships.push({
              category: 'Related Entities',
              color: NODE_COLORS.entity,
              items: items
            });
          }
        }
      } catch (error) {
        console.error('Error fetching entity_relationships:', error);
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
    hosting_accounts: ['provider', 'account_name'],
    securities_held: ['symbol', 'name']
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
    hosting_accounts: 'Hosting Accounts',
    securities_held: 'Securities Held',
    entity_related_data: 'Related Data',
    entity_relationships: 'Entity Relationships'
  };

  return labels[table as keyof typeof labels] || table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
} 