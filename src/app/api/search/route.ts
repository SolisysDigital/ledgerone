import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { AppLogger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0, page, limit });
    }

    const supabase = getServiceSupabase();
    const searchTerm = query.trim();

    console.log(`[SEARCH] Searching for: "${searchTerm}"`);

    // Use the database function to search all objects
    const { data, error } = await (supabase as any)
      .rpc('search_all_objects', {
        search_term: searchTerm,
        page_num: page,
        page_size: limit
      });

    if (error) {
      console.error('[SEARCH] Database function error:', error);
      AppLogger.error('Search function error', { error, query: searchTerm });
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      );
    }

    console.log(`[SEARCH] Found ${data?.length || 0} results`);

    // Transform the results to match the expected format
    const results = (data || []).map((item: any) => ({
      id: item.id,
      type: item.object_type,
      typeLabel: item.object_type_label,
      icon: item.icon,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      url: `/${item.object_type}/${item.id}`,
      created_at: item.created_at || null,
      updated_at: item.updated_at || null
    }));

    const total = data && data.length > 0 ? data[0].total_count : 0;
    const hasMore = (page * limit) < total;

    AppLogger.info('Global search completed', { 
      query: searchTerm, 
      totalResults: total, 
      returnedResults: results.length,
      page,
      limit 
    });

    return NextResponse.json({
      results,
      total,
      page,
      limit,
      hasMore
    });


  } catch (error) {
    AppLogger.error('Global search error', { error, query: request.nextUrl.searchParams.get('q') });
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
