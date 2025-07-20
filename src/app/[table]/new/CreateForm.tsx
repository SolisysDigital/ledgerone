"use client";

import React, { useMemo } from "react";
import { FieldConfig } from "@/lib/tableConfigs";
import { createItem } from "@/lib/actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

interface CreateFormProps {
  table: string;
  config: any;
}

export default function CreateForm({ table, config }: CreateFormProps) {
  const searchParams = useSearchParams();
  const form = useForm();
  
  const prefill = useMemo(() => {
    const result: Record<string, string> = {};
    const fk = searchParams.get("fk");
    const fkField = searchParams.get("fkField");
    if (fk && fkField) {
      result[fkField] = fk;
    }
    return result;
  }, [searchParams]);

  // Update form with default values
  React.useEffect(() => {
    form.reset(prefill);
  }, [form, prefill]);

  const onSubmit = async (data: Record<string, string>) => {
    await createItem(table, data);
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
                <FormLabel>{field.name}</FormLabel>
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
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}

// Simple FkCombobox component using Select
function FkCombobox({ field, formField }: { field: FieldConfig; formField: any }) {
  // For now, use a simple input. In a real implementation, you would fetch options from supabase
  return <Input {...formField} placeholder={`Enter ${field.refTable} ID`} />;
} 