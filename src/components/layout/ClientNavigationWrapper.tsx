'use client';

import Navigation from "@/components/Navigation";

interface ClientNavigationWrapperProps {
  children: React.ReactNode;
}

export function ClientNavigationWrapper({ children }: ClientNavigationWrapperProps) {
  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 