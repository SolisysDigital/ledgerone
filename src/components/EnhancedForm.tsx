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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordian";
import { AppLogger } from "@/lib/logger";

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
      console.log('=== FORM SUBMISSION STARTED ===');
      console.log('Raw form data:', data);
      
      // Log form submission start
      await AppLogger.debug('EnhancedForm', 'form_submission_start', `Form submission started for table: ${table}`, { 
        table, 
        isUpdate: !!initialData, 
        rawData: data 
      });
      
      // Clean up the data - handle updates vs creates differently
      const cleanedData: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        // For updates, include all fields even if empty to allow clearing
        // For creates, only include non-empty values
        if (initialData) {
          // This is an update - include all fields
          cleanedData[key] = value === '' ? null : value;
        } else {
          // This is a create - only include non-empty values
          if (value !== undefined && value !== null && value !== '') {
            cleanedData[key] = value;
          }
        }
      });
      
      console.log('Cleaned data:', cleanedData);
      console.log('Table:', table);
      console.log('Is update:', !!initialData);
      
      // Log cleaned data
      await AppLogger.debug('EnhancedForm', 'data_cleaning', `Data cleaned for ${table}`, { 
        table, 
        isUpdate: !!initialData, 
        cleanedData 
      });
      
      // Ensure we have at least the required fields
      if (!cleanedData.name || !cleanedData.type) {
        const error = new Error('Missing required fields: name or type');
        console.error('Missing required fields: name or type');
        await AppLogger.error('EnhancedForm', 'validation', 'Missing required fields', error, { 
          table, 
          cleanedData, 
          missingFields: { name: !cleanedData.name, type: !cleanedData.type } 
        });
        alert('Please fill in the required fields: Entity Name and Type of Entity');
        return;
      }
      
      console.log('=== ABOUT TO CALL onSubmit ===');
      await AppLogger.debug('EnhancedForm', 'onSubmit_call', `About to call onSubmit for ${table}`, { 
        table, 
        cleanedData 
      });
      
      await onSubmit(cleanedData);
      
      console.log('=== FORM SUBMISSION COMPLETED ===');
      await AppLogger.info('EnhancedForm', 'form_submission_success', `Form submitted successfully for ${table}`, { 
        table, 
        cleanedData 
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      await AppLogger.error('EnhancedForm', 'form_submission_error', 'Form submission failed', error, { 
        table, 
        rawData: data 
      });
      alert('Error submitting form. Please check the console for details.');
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

  // Helper: group fields
  const legalInfoFields = [
    'legal_business_name',
    'employer_identification_number',
    'incorporation_date',
    'country_of_formation',
    'state_of_formation',
    'business_type',
    'industry',
    'naics_code',
    'legal_address',
    'mailing_address',
    'registered_agent_name',
    'registered_agent_address',
  ];
  const officerFields = [
    ['officer1_name', 'officer1_title', 'officer1_ownership_percent'],
    ['officer2_name', 'officer2_title', 'officer2_ownership_percent'],
    ['officer3_name', 'officer3_title', 'officer3_ownership_percent'],
    ['officer4_name', 'officer4_title', 'officer4_ownership_percent'],
  ];
  const texasFields = [
    'texas_taxpayer_number',
    'texas_file_number',
    'texas_webfile_number',
    'texas_webfile_login',
    'texas_webfile_password',
  ];

  // Get state_of_formation value for conditional rendering
  const stateOfFormation = form.watch('state_of_formation');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Main fields (not legal info) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.fields.filter((f: FieldConfig) => !legalInfoFields.includes(f.name) && !texasFields.includes(f.name) && !officerFields.flat().includes(f.name) && f.name !== 'short_description' && f.name !== 'description').map((field: FieldConfig) => {
            if (field.type === "fk" && initialData && initialData[field.name]) return null;
            return (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="capitalize font-medium">
                      {field.label || field.name.replace(/_/g, ' ')}
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
        
        {/* Horizontal layout for short_description and description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Short Description */}
          <FormField
            control={form.control}
            name="short_description"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="capitalize font-medium">
                  Short Description
                </FormLabel>
                <FormControl>
                  <Input 
                    {...formField} 
                    value={formField.value as string || ''}
                    placeholder="Enter short description (max 50 characters)"
                    maxLength={50}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="capitalize font-medium">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea 
                    {...formField} 
                    value={formField.value as string || ''}
                    placeholder="Enter detailed description"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Legal Info Accordion - Only show for entities table */}
        {table === 'entities' && (
          <Accordion type="single" collapsible defaultValue="legal-info">
            <AccordionItem value="legal-info">
              <AccordionTrigger className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-lg px-4 py-2">Legal Information for the entity</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {config.fields.filter((f: FieldConfig) => legalInfoFields.includes(f.name)).map((field: FieldConfig) => {
                    if (field.name === 'naics_code') {
                      return (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="capitalize font-medium flex items-center gap-2">
                                NAICS Code
                                <a href="https://www.census.gov/naics/" target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">Help</a>
                              </FormLabel>
                              <FormControl>
                                {renderField(field, formField)}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    }
                    return (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel className="capitalize font-medium">
                              {field.label || field.name.replace(/_/g, ' ')}
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
                {/* Officer Section */}
                <div className="mt-8">
                  <div className="font-semibold mb-2">Officers (up to 4)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {officerFields.map((fields, idx) => (
                      <div key={idx} className="border rounded p-3 mb-2">
                        <div className="font-medium mb-1">Officer {idx + 1}</div>
                        {fields.map((fname) => {
                          const field = config.fields.find((f: FieldConfig) => f.name === fname);
                          if (!field) return null;
                          return (
                            <FormField
                              key={field.name}
                              control={form.control}
                              name={field.name}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel className="capitalize font-medium">
                                    {field.label || field.name.replace(/_/g, ' ')}
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
                    ))}
                  </div>
                </div>
                {/* Texas-specific fields */}
                {stateOfFormation === 'Texas' && (
                  <div className="mt-8">
                    <div className="font-semibold mb-2 flex items-center gap-2">Texas-Specific Info
                      <a href="https://security.app.cpa.state.tx.us/Public/create-account" target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">Webfile Portal</a>
                      <a href="https://mycpa.cpa.state.tx.us/coa/search.do" target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">Entity Search</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {config.fields.filter((f: FieldConfig) => texasFields.includes(f.name)).map((field: FieldConfig) => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="capitalize font-medium">
                                {field.name.replace(/_/g, ' ')}
                              </FormLabel>
                              <FormControl>
                                {renderField(field, formField)}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
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