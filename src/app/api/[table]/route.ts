import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { tableConfigs } from '@/lib/tableConfigs';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const resolvedParams = await params;
    const { table } = resolvedParams;
    
    // Build-time safety check
    if (!table) {
      return NextResponse.json({ error: 'Invalid table parameter' }, { status: 400 });
    }
    
    // Exclude auth routes from being caught by this dynamic route
    if (table === 'auth') {
      return NextResponse.json({ error: 'Auth routes not handled here' }, { status: 404 });
    }
    
    const config = tableConfigs[table as keyof typeof tableConfigs];
    if (!config) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();
    console.log(`[API] Using service role client for table: ${table}`);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' });

    // Add search filter if provided
    if (search) {
      // Try to find a good search field
      const searchFields = ['name', 'title', 'email', 'phone', 'url', 'bank_name', 'provider', 'platform', 'cardholder_name'];
      const availableFields = config.fields.map(f => f.name);
      const searchableFields = searchFields.filter(field => availableFields.includes(field));
      
      if (searchableFields.length > 0) {
        const searchConditions = searchableFields.map(field => `${field}.ilike.%${search}%`);
        query = query.or(searchConditions.join(','));
      }
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    console.log(`[API] Table ${table}: Found ${totalRecords} records, returning ${data?.length || 0} records`);

    return NextResponse.json({
      records: data || [],
      totalRecords,
      totalPages,
      currentPage: page,
      limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 