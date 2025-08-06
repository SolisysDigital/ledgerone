'use client';

import { usePathname } from 'next/navigation';
import { ProtectedRoute } from './ProtectedRoute';

interface ConditionalProtectedRouteProps {
  children: React.ReactNode;
}

export function ConditionalProtectedRoute({ children }: ConditionalProtectedRouteProps) {
  const pathname = usePathname();
  
  // Don't protect the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  // Protect all other pages
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 