"use client";

import React from "react";
import { updateItem } from "@/lib/actions";
import EnhancedForm from "@/components/EnhancedForm";
import { useRouter } from "next/navigation";

interface EditFormProps {
  table: string;
  config: any;
  initialData: any;
}

export default function EditForm({ table, config, initialData }: EditFormProps) {
  const router = useRouter();

  const onSubmit = async (data: Record<string, string>) => {
    try {
      await updateItem(table, initialData.id, data);
      router.push(`/${table}/${initialData.id}`);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <EnhancedForm
      table={table}
      config={config}
      initialData={initialData}
      onSubmit={onSubmit}
      submitLabel="Update"
    />
  );
} 