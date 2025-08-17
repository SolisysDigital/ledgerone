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
      
      const result = await updateItem(table, initialData.id, data);
      
      if (result.success) {
        console.log('=== EDITFORM SUBMISSION COMPLETED ===');
        await AppLogger.info('EditForm', 'submission_success', `EditForm submission completed for ${table}`, { 
          table, 
          entityId: initialData.id, 
          data 
        });
        
        // Navigate to the detail page on success
        router.push(`/${table}/${initialData.id}`);
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      
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