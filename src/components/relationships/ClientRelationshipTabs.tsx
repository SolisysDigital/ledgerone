"use client";

import React from "react";
import RelationshipTabs from "./RelationshipTabs";

interface ClientRelationshipTabsProps {
  entityId: string;
}

export default function ClientRelationshipTabs({ entityId }: ClientRelationshipTabsProps) {
  return <RelationshipTabs entityId={entityId} />;
} 