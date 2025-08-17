"use client";

import React, { useMemo } from "react";
import { createItem } from "@/lib/actions";
import EnhancedForm from "@/components/EnhancedForm";
import { useSearchParams, useRouter } from "next/navigation";

interface CreateFormProps {
  table: string;
  config: any;
  entityName?: string;
}

export default function CreateForm({ table, config, entityName }: CreateFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
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
    try {
      const result = await createItem(table, data);
      
      if (result.success) {
        // Navigate to the table listing page on success
        router.push(`/${table}`);
      } else {
        throw new Error(result.error || 'Creation failed');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item. Please check the console for details.');
    }
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