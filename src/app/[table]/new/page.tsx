"use client";

import React, { useMemo } from "react";
import { tableConfigs, FieldConfig } from "@/lib/tableConfigs";
import { createItem } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSearchParams } from "next/navigation";

// Note: This is a client component because of useForm
export default function CreatePage({ params }: { params: { table: string } }) {
  const searchParams = useSearchParams();
  const form = useForm();
  
  const table = params.table;
  const config = tableConfigs[table as keyof typeof tableConfigs];
  
  const prefill = useMemo(() => {
    const result: Record<string, string> = {};
    const fk = searchParams.get("fk");
    const fkField = searchParams.get("fkField");
    if (fk && fkField) {
      result[fkField] = fk;
    }
    return result;
  }, [searchParams]);

  if (!config) return <div>Table not found</div>;

  // Update form with default values
  React.useEffect(() => {
    form.reset(prefill);
  }, [form, prefill]);

  const onSubmit = async (data: Record<string, string>) => {
    await createItem(table, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create {config.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {config.fields.map((field) => (
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
                      {field.type === "date" && <Input type="date" {...formField} />} {/* Use DatePicker for better UX */}
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
      </CardContent>
    </Card>
  );
}

// Simple FkCombobox component using Select
function FkCombobox({ field, formField }: { field: FieldConfig; formField: any }) {
  // For now, use a simple input. In a real implementation, you would fetch options from supabase
  return <Input {...formField} placeholder={`Enter ${field.refTable} ID`} />;
}