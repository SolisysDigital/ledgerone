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
      console.log('=== EDITFORM SUBMISSION STARTED ===');
      console.log('EditForm submitting data:', data);
      await updateItem(table, initialData.id, data);
      console.log('=== EDITFORM SUBMISSION COMPLETED ===');
      router.push(`/${table}/${initialData.id}`);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating entity. Please check the console for details.');
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