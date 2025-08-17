import React from "react";

export function DetailTile({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 break-words">{value ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
