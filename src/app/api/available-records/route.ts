import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeOfRecord = searchParams.get('type');
    const entityId = searchParams.get('entityId');

    if (!typeOfRecord || !entityId) {
      return NextResponse.json({ error: 'Type and entity ID are required' }, { status: 400 });
    }

    // Get display field mapping
    const getDisplayField = (type: string) => {
      const displayFields: Record<string, string> = {
        contacts: 'name',
        emails: 'email',
        phones: 'phone',
        bank_accounts: 'bank_name',
        investment_accounts: 'provider',
        crypto_accounts: 'platform',
        credit_cards: 'cardholder_name',
        websites: 'url',
        hosting_accounts: 'provider'
      };
      return displayFields[type] || 'name';
    };

    const displayField = getDisplayField(typeOfRecord);

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();

    // Get existing relationships for this entity and type
    const { data: existingRelationships, error: existingError } = await supabase
      .from('entity_related_data')
      .select('related_data_id')
      .eq('entity_id', entityId)
      .eq('type_of_record', typeOfRecord);

    if (existingError) {
      await AppLogger.error('api/available-records', 'GET', 'Failed to fetch existing relationships', existingError, { typeOfRecord, entityId });
      return NextResponse.json({ error: 'Failed to fetch existing relationships' }, { status: 500 });
    }

    // Get IDs of already related records
    const existingIds = (existingRelationships || []).map((r: any) => r.related_data_id);

    // Get all records of the specified type
    const { data: allRecords, error: allRecordsError } = await supabase
      .from(typeOfRecord)
      .select('*')
      .order(displayField, { ascending: true });

    if (allRecordsError) {
      await AppLogger.error('api/available-records', 'GET', 'Failed to fetch all records', allRecordsError, { typeOfRecord, entityId });
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }

    // Filter out existing records
    const availableRecords = (allRecords || []).filter((record: any) => !existingIds.includes(record.id));

    await AppLogger.info('api/available-records', 'GET', 'Successfully fetched available records', { typeOfRecord, entityId, count: availableRecords?.length });
    return NextResponse.json(availableRecords);
  } catch (error) {
    await AppLogger.error('api/available-records', 'GET', 'Exception in GET available records', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 