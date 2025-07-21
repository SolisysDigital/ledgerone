"use client";

import React, { useEffect, useState } from "react";
import { FieldConfig } from "@/lib/tableConfigs";
import { supabase } from "@/lib/supabase";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X } from "lucide-react";

interface EnhancedFormProps {
  table: string;
  config: any;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
}

interface FkOption {
  id: string;
  display: string;
}

export default function EnhancedForm({ 
  table, 
  config, 
  initialData, 
  onSubmit, 
  submitLabel = "Save" 
}: EnhancedFormProps) {
  const [fkOptions, setFkOptions] = useState<Record<string, FkOption[]>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // Build validation schema
  const schemaObject: Record<string, any> = {};
  config.fields.forEach((field: FieldConfig) => {
    if (field.type === "number") {
      schemaObject[field.name] = z.string().optional();
    } else if (field.type === "date") {
      schemaObject[field.name] = z.string().optional();
    } else {
      schemaObject[field.name] = z.string().optional();
    }
  });

  const formSchema = z.object(schemaObject);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  // Fetch foreign key options
  useEffect(() => {
    const fetchFkOptions = async () => {
      const fkFields = config.fields.filter((field: FieldConfig) => field.type === "fk");
      
      for (const field of fkFields) {
        if (field.refTable && field.displayField) {
          const { data, error } = await supabase
            .from(field.refTable)
            .select(`id, ${field.displayField}`)
            .order(field.displayField);

          if (!error && data) {
            setFkOptions(prev => ({
              ...prev,
              [field.name]: data.map((item: any) => ({
                id: item.id,
                display: item[field.displayField!]
              }))
            }));
          }
        }
      }
    };

    fetchFkOptions();
  }, [config.fields]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderField = (field: FieldConfig, formField: any) => {
    switch (field.type) {
      case "text":
        return <Input {...formField} placeholder={`Enter ${field.name.replace(/_/g, ' ')}`} />;
      
      case "textarea":
        return <Textarea {...formField} placeholder={`Enter ${field.name.replace(/_/g, ' ')}`} rows={3} />;
      
      case "number":
        return <Input type="number" step="any" {...formField} placeholder={`Enter ${field.name.replace(/_/g, ' ')}`} />;
      
      case "date":
        return <Input type="date" {...formField} />;
      
      case "select":
        return (
          <Select onValueChange={formField.onChange} defaultValue={formField.value}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name.replace(/_/g, ' ')}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "fk":
        return <FkCombobox field={field} formField={formField} options={fkOptions[field.name] || []} searchTerm={searchTerms[field.name] || ''} onSearchChange={(value) => setSearchTerms(prev => ({ ...prev, [field.name]: value }))} />;
      
      default:
        return <Input {...formField} />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.fields.map((field: FieldConfig) => {
            // Hide foreign key fields that are pre-filled (like entity_id when creating legal info)
            if (field.type === "fk" && initialData && initialData[field.name]) {
              return null;
            }
            
            return (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="capitalize font-medium">
                      {field.name.replace(/_/g, ' ')}
                      {field.type === "fk" && <Badge variant="outline" className="ml-2 text-xs">Related</Badge>}
                    </FormLabel>
                    <FormControl>
                      {renderField(field, formField)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </div>
        
        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button type="submit" className="min-w-[100px]">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface FkComboboxProps {
  field: FieldConfig;
  formField: any;
  options: FkOption[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

function FkCombobox({ field, formField, options, searchTerm, onSearchChange }: FkComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FkOption | null>(
    options.find(opt => opt.id === formField.value) || null
  );

  const filteredOptions = options.filter(option =>
    option.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: FkOption) => {
    setSelectedOption(option);
    formField.onChange(option.id);
    setIsOpen(false);
    onSearchChange('');
  };

  const handleClear = () => {
    setSelectedOption(null);
    formField.onChange('');
    onSearchChange('');
  };

  return (
    <div className="relative">
      {selectedOption ? (
        <div className="flex items-center justify-between p-2 border rounded-md bg-background">
          <span className="text-sm">{selectedOption.display}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder={`Search ${field.refTable}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pr-8"
          />
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      {isOpen && !selectedOption && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                onClick={() => handleSelect(option)}
              >
                {option.display}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 