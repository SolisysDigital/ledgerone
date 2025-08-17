import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn, FieldValues } from "react-hook-form";

type FormGridProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  formFields: Array<keyof T>;
  fieldLabels?: Record<string, string>;
  fieldTypes?: Record<string, 'text' | 'textarea' | 'select' | 'number' | 'date'>;
  fieldOptions?: Record<string, string[]>;
  fieldPlaceholders?: Record<string, string>;
  fieldMaxLengths?: Record<string, number>;
};

export function FormGrid<T extends Record<string, any>>({ 
  form, 
  formFields, 
  fieldLabels = {},
  fieldTypes = {},
  fieldOptions = {},
  fieldPlaceholders = {},
  fieldMaxLengths = {}
}: FormGridProps<T>) {
  const getFieldLabel = (fieldName: string): string => {
    return fieldLabels[fieldName] || fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFieldType = (fieldName: string): 'text' | 'textarea' | 'select' | 'number' | 'date' => {
    return fieldTypes[fieldName] || 'text';
  };

  const renderField = (fieldName: string, fieldType: string) => {
    const label = getFieldLabel(fieldName);
    const placeholder = fieldPlaceholders[fieldName] || `Enter ${label.toLowerCase()}`;
    const maxLength = fieldMaxLengths[fieldName];

    switch (fieldType) {
      case 'textarea':
        return (
          <Textarea 
            placeholder={placeholder}
            rows={3}
            maxLength={maxLength}
          />
        );
      
      case 'select':
        const options = fieldOptions[fieldName] || [];
        return (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input 
            type="number" 
            placeholder={placeholder}
            step="0.01"
          />
        );
      
      case 'date':
        return (
          <Input 
            type="date" 
            placeholder={placeholder}
          />
        );
      
      default:
        return (
          <Input 
            placeholder={placeholder}
            maxLength={maxLength}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {formFields.map((fieldName) => {
        const fieldType = getFieldType(fieldName as string);
        
        return (
          <FormField
            key={fieldName as string}
            control={form.control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="capitalize font-medium">
                  {getFieldLabel(fieldName as string)}
                  {fieldType === "select" && <Badge variant="outline" className="ml-2 text-xs">Options</Badge>}
                </FormLabel>
                <FormControl>
                  {React.cloneElement(renderField(fieldName as string, fieldType), {
                    ...formField,
                    value: formField.value || ''
                  })}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
}
