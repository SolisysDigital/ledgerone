"use client";

import React, { useEffect, useState } from "react";
import RelationshipTabs from "./RelationshipTabs";

interface ClientRelationshipTabsProps {
  entityId: string;
}

export default function ClientRelationshipTabs({ entityId }: ClientRelationshipTabsProps) {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ClientRelationshipTabs: Component mounted with entityId:', entityId);
    setIsClient(true);
    
    // Add error boundary for React errors
    const handleError = (error: ErrorEvent) => {
      console.error('ClientRelationshipTabs: React error caught:', error);
      setError(`React Error: ${error.message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('ClientRelationshipTabs: Unhandled promise rejection:', event.reason);
      setError(`Promise Rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [entityId]);

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p>Loading relationships...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <h3 className="text-lg font-semibold mb-2">Error Loading Relationships</h3>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  try {
    console.log('ClientRelationshipTabs: Rendering RelationshipTabs with entityId:', entityId);
    return <RelationshipTabs entityId={entityId} />;
  } catch (error) {
    console.error('ClientRelationshipTabs: Error rendering RelationshipTabs:', error);
    return (
      <div className="text-center py-8 text-red-600">
        <h3 className="text-lg font-semibold mb-2">Error Loading Relationships</h3>
        <p className="text-sm mb-4">Failed to load relationship data.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }
} 