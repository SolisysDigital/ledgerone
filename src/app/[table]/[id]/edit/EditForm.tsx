"use client";

import React, { useMemo } from "react";
import { tableConfigs, FieldConfig } from "@/lib/tableConfigs";
import { updateItem } from "@/lib/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

interface EditFormProps {
  table: string;
  config: any;
  initialData: any;
}

export default function EditForm({ table, config, initialData }: EditFormProps) {
  const router = useRouter();
  const form = useForm({
    defaultValues: initialData,
  });

  const onSubmit = async (data: Record<string, string>) => {
    try {
      await updateItem(table, initialData.id, data);
      router.push(`/${table}/${initialData.id}`);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {config.fields.map((field: FieldConfig) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="capitalize">{field.name.replace(/_/g, ' ')}</FormLabel>
                <FormControl>
                  {field.type === "text" && <Input {...formField} />}
                  {field.type === "textarea" && <Textarea {...formField} />}
                  {field.type === "number" && <Input type="number" {...formField} />}
                  {field.type === "date" && <Input type="date" {...formField} />}
                  {field.type === "select" && (
                    <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === "fk" && <FkCombobox field={field} formField={formField} />}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex space-x-2">
          <Button type="submit">Update</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Simple FkCombobox component using Select
function FkCombobox({ field, formField }: { field: FieldConfig; formField: any }) {
  // For now, use a simple input. In a real implementation, you would fetch options from supabase
  return <Input {...formField} placeholder={`Enter ${field.refTable} ID`} />;
} 