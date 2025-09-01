"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import SearchResults from '@/components/search/SearchResults';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: string;
  typeLabel: string;
  icon: string;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query);

  const limit = 20;

  const performSearch = async (searchQuery: string, pageNum: number = 1, append: boolean = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        getApiUrl(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=${pageNum}&limit=${limit}`)
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (append) {
        setResults(prev => [...prev, ...data.results]);
      } else {
        setResults(data.results);
      }

      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Update URL with new search query
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      performSearch(query, page + 1, true);
    }
  };

  // Perform search when query changes
  useEffect(() => {
    if (query) {
      setSearchInput(query);
      performSearch(query, 1, false);
    } else {
      setResults([]);
      setTotal(0);
      setHasMore(false);
    }
  }, [query]);

  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/home')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Search Results
            </h1>
            <p className="text-gray-600">
              Search across all your data
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search across all data..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="px-8 py-3 bg-teal-600 text-white"
                disabled={!searchInput.trim() || isLoading}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && page === 1 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Searching...</div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && (
            <SearchResults
              query={query}
              results={results}
              total={total}
              page={page}
              limit={limit}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              isLoading={isLoading}
            />
          )}

          {/* No Query State */}
          {!query && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                Enter a search term to find your data
              </div>
              <p className="text-gray-400">
                Search across entities, contacts, emails, phones, websites, accounts, and more.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
