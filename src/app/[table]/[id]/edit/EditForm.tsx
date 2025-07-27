"use client";

import React from "react";
import { updateItem } from "@/lib/actions";
import EnhancedForm from "@/components/EnhancedForm";
import { useRouter } from "next/navigation";
import { AppLogger } from "@/lib/logger";

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
      
      // Log EditForm submission start
      await AppLogger.debug('EditForm', 'submission_start', `EditForm submission started for ${table}`, { 
        table, 
        entityId: initialData.id, 
        data 
      });
      
      await updateItem(table, initialData.id, data);
      
      console.log('=== EDITFORM SUBMISSION COMPLETED ===');
      await AppLogger.info('EditForm', 'submission_success', `EditForm submission completed for ${table}`, { 
        table, 
        entityId: initialData.id, 
        data 
      });
      
      // The updateItem function will handle the redirect, so we don't need to push here
      // router.push(`/${table}/${initialData.id}`);
    } catch (error) {
      console.error('Error updating item:', error);
      
      // Check if this is a redirect error (which is actually success)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        console.log('Update successful - redirecting...');
        router.push(`/${table}/${initialData.id}`);
        return;
      }
      
      await AppLogger.error('EditForm', 'submission_error', 'EditForm submission failed', error, { 
        table, 
        entityId: initialData.id, 
        data 
      });
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