"use client";

import React, { useMemo } from "react";
import { createItem } from "@/lib/actions";
import EnhancedForm from "@/components/EnhancedForm";
import { useSearchParams } from "next/navigation";

interface CreateFormProps {
  table: string;
  config: any;
}

export default function CreateForm({ table, config }: CreateFormProps) {
  const searchParams = useSearchParams();
  
  const prefill = useMemo(() => {
    const result: Record<string, string> = {};
    const fk = searchParams.get("fk");
    const fkField = searchParams.get("fkField");
    if (fk && fkField) {
      result[fkField] = fk;
    }
    return result;
  }, [searchParams]);

  const onSubmit = async (data: Record<string, string>) => {
    await createItem(table, data);
  };

  return (
    <EnhancedForm
      table={table}
      config={config}
      initialData={prefill}
      onSubmit={onSubmit}
      submitLabel="Create"
    />
  );
} 