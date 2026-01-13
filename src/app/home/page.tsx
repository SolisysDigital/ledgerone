"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to global search page
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-2xl px-6 -mt-[25vh]">
            {/* Logo and Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                LedgerOne
              </h1>
              <p className="text-lg text-gray-600">
                Search across all your data
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg"
                  className="px-8 py-3 bg-teal-600 text-white flex items-center space-x-2"
                  disabled={!searchQuery.trim()}
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 