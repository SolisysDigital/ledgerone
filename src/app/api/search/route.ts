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
    const results: any[] = [];
    const searchTerm = `%${query.trim()}%`;

    // Define searchable tables and their search fields
    const searchConfig = {
      entities: {
        label: 'Entities',
        fields: ['name', 'type', 'short_description', 'description', 'legal_business_name', 'industry'],
        icon: '🏢'
      },
      contacts: {
        label: 'Contacts',
        fields: ['name', 'title', 'email', 'phone', 'short_description', 'description'],
        icon: '👤'
      },
      emails: {
        label: 'Emails',
        fields: ['email', 'label', 'short_description', 'description'],
        icon: '📧'
      },
      phones: {
        label: 'Phones',
        fields: ['phone', 'label', 'short_description', 'description'],
        icon: '📞'
      },
      websites: {
        label: 'Websites',
        fields: ['url', 'label', 'short_description', 'description'],
        icon: '🌐'
      },
      bank_accounts: {
        label: 'Bank Accounts',
        fields: ['bank_name', 'account_number', 'institution_held_at', 'short_description', 'description'],
        icon: '🏦'
      },
      investment_accounts: {
        label: 'Investment Accounts',
        fields: ['provider', 'account_type', 'account_number', 'institution_held_at', 'short_description', 'description'],
        icon: '📈'
      },
      crypto_accounts: {
        label: 'Crypto Accounts',
        fields: ['platform', 'account_number', 'wallet_address', 'short_description', 'description'],
        icon: '₿'
      },
      credit_cards: {
        label: 'Credit Cards',
        fields: ['cardholder_name', 'issuer', 'type', 'institution_held_at', 'short_description', 'description'],
        icon: '💳'
      },
      hosting_accounts: {
        label: 'Hosting Accounts',
        fields: ['provider', 'username', 'login_url', 'short_description', 'description'],
        icon: '🖥️'
      }
    };

    // Search each table
    for (const [tableName, config] of Object.entries(searchConfig)) {
      try {
        console.log(`[SEARCH] Searching table: ${tableName} for query: ${query}`);
        
        // Try a simpler approach - search one field at a time
        let foundData: any[] = [];
        
        for (const field of config.fields) {
          try {
            const { data, error } = await (supabase as any)
              .from(tableName)
              .select('*')
              .ilike(field, searchTerm)
              .range((page - 1) * limit, page * limit - 1)
              .order('created_at', { ascending: false });
            
            if (error) {
              console.log(`[SEARCH] Error searching ${tableName}.${field}:`, error);
              continue;
            }
            
            if (data && data.length > 0) {
              foundData = [...foundData, ...data];
            }
          } catch (fieldError) {
            console.log(`[SEARCH] Field error for ${tableName}.${field}:`, fieldError);
            continue;
          }
        }
        
        // Remove duplicates based on ID
        const uniqueData = foundData.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        );
        
        console.log(`[SEARCH] Results for ${tableName}:`, uniqueData.length, 'records');

        if (uniqueData && uniqueData.length > 0) {
          // Transform results to unified format
          const transformedResults = uniqueData.map((item: any) => {
            // Determine the primary title field based on table
            let title = '';
            let subtitle = '';
            
            switch (tableName) {
              case 'entities':
                title = item.name || 'Unnamed Entity';
                subtitle = item.type || '';
                break;
              case 'contacts':
                title = item.name || 'Unnamed Contact';
                subtitle = item.title || item.email || '';
                break;
              case 'emails':
                title = item.email || 'No Email';
                subtitle = item.label || '';
                break;
              case 'phones':
                title = item.phone || 'No Phone';
                subtitle = item.label || '';
                break;
              case 'websites':
                title = item.url || 'No URL';
                subtitle = item.label || '';
                break;
              case 'bank_accounts':
                title = item.bank_name || 'Unnamed Bank Account';
                subtitle = item.account_number ? `****${item.account_number.slice(-4)}` : '';
                break;
              case 'investment_accounts':
                title = item.provider || 'Unnamed Investment Account';
                subtitle = item.account_type || '';
                break;
              case 'crypto_accounts':
                title = item.platform || 'Unnamed Crypto Account';
                subtitle = item.account_number || '';
                break;
              case 'credit_cards':
                title = item.cardholder_name || 'Unnamed Credit Card';
                subtitle = item.issuer || '';
                break;
              case 'hosting_accounts':
                title = item.provider || 'Unnamed Hosting Account';
                subtitle = item.username || '';
                break;
              default:
                title = 'Unknown';
            }

            return {
              id: item.id,
              type: tableName,
              typeLabel: config.label,
              icon: config.icon,
              title,
              subtitle,
              description: item.short_description || item.description || '',
              url: `/${tableName}/${item.id}`,
              created_at: item.created_at,
              updated_at: item.updated_at
            };
          });

          results.push(...transformedResults);
        }
      } catch (tableError) {
        AppLogger.error(`Error searching table ${tableName}`, { error: tableError, query });
        continue;
      }
    }

    // Sort results by relevance (simple implementation - could be enhanced)
    results.sort((a, b) => {
      // Prioritize exact matches in title
      const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
      const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      // Then by creation date (newer first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    AppLogger.info('Global search completed', { 
      query, 
      totalResults: results.length, 
      returnedResults: paginatedResults.length,
      page,
      limit 
    });

    return NextResponse.json({
      results: paginatedResults,
      total: results.length,
      page,
      limit,
      hasMore: endIndex < results.length
    });

  } catch (error) {
    AppLogger.error('Global search error', { error, query: request.nextUrl.searchParams.get('q') });
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
