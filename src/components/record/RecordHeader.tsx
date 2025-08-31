import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type RecordHeaderProps = {
  title: string;         // e.g., "Credit Cards Details" or "Edit Credit Cards"
  id: string;            // UUID
  primaryName?: string;  // teal chip (e.g., "visa card"), optional fallback to title
  backHref: string;
  actions?: React.ReactNode; // Edit/Delete/Save buttons
};

export default function RecordHeader({ title, id, primaryName, backHref, actions }: RecordHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Link>
          </Button>
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>ID: {id}</span>
          {primaryName && (
            <span className="rounded-md bg-teal-700/10 px-2 py-1 text-teal-700 text-sm font-medium">
              {primaryName}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}
