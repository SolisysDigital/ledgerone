import React from "react";

export function DetailTile({ label, value, className = "" }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 break-words">{value ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
