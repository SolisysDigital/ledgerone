"use client";

import React, { useEffect } from "react";
import RelationshipTabs from "./RelationshipTabs";

interface ClientRelationshipTabsProps {
  entityId: string;
}

export default function ClientRelationshipTabs({ entityId }: ClientRelationshipTabsProps) {
  useEffect(() => {
    console.log('ClientRelationshipTabs: Component mounted with entityId:', entityId);
    
    // Add error boundary for React errors
    const handleError = (error: ErrorEvent) => {
      console.error('ClientRelationshipTabs: React error caught:', error);
      alert(`React Error: ${error.message}\n\nPlease check the console for more details.`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('ClientRelationshipTabs: Unhandled promise rejection:', event.reason);
      alert(`Promise Rejection: ${event.reason}\n\nPlease check the console for more details.`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [entityId]);

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