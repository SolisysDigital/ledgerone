"use client";

import React, { useEffect, useState } from "react";
import { FieldConfig } from "@/lib/tableConfigs";
import { getApiUrl } from "@/lib/utils";
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
  onCancel?: () => void;
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
  onCancel,
  submitLabel = "Save" 
}: EnhancedFormProps) {
  const [fkOptions, setFkOptions] = useState<Record<string, FkOption[]>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // Build validation schema
  const schemaObject: Record<string, any> = {};
  config.fields.forEach((field: FieldConfig) => {
    // Skip foreign key fields from Zod validation - they're handled automatically
    if (field.type === "fk") {
      return;
    }
    
    if (field.type === "number") {
      // For number fields, allow string, null, undefined, or empty string (all optional)
      schemaObject[field.name] = z.union([
        z.string(),
        z.number(),
        z.null(),
        z.undefined()
      ]).optional();
    } else if (field.type === "date") {
      // For date fields, allow string, null, or undefined (all optional)
      schemaObject[field.name] = z.union([
        z.string(),
        z.null(),
        z.undefined()
      ]).optional();
    } else {
      // For text fields, allow string, null, or undefined (all optional)
      // All fields are truly optional, including Texas-specific fields and officer fields
      schemaObject[field.name] = z.union([
        z.string(),
        z.null(),
        z.undefined()
      ]).optional();
    }
  });

  const formSchema = z.object(schemaObject);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
    mode: 'onChange', // Allow validation on change for better UX
    reValidateMode: 'onChange', // Re-validate on change
  });

  // Fetch foreign key options
  useEffect(() => {
    const fetchFkOptions = async () => {
      const fkFields = config.fields.filter((field: FieldConfig) => field.type === "fk");
      
      for (const field of fkFields) {
        if (field.refTable && field.displayField) {
          try {
            const response = await fetch(getApiUrl(`/${field.refTable}`), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data && Array.isArray(data)) {
                setFkOptions(prev => ({
                  ...prev,
                  [field.name]: data.map((item: any) => ({
                    id: item.id,
                    display: item[field.displayField!]
                  }))
                }));
              }
            }
          } catch (error) {
            console.error(`Error fetching FK options for ${field.refTable}:`, error);
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
      
      // Log form validation state for debugging
      const formState = form.formState;
      console.log('Form validation state:', formState);
      console.log('Form errors:', formState.errors);
      
      // Log any validation errors but don't block submission
      if (Object.keys(formState.errors).length > 0) {
        console.warn('Form has validation errors:', formState.errors);
        await AppLogger.warning('EnhancedForm', 'validation_warnings', 'Form has validation warnings', { 
          table, 
          errors: formState.errors,
          rawData: data 
        });
      }
      
      // Clean up the data - handle updates vs creates differently
      const cleanedData: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        // Get field configuration to understand the expected type
        const fieldConfig = config.fields.find((f: FieldConfig) => f.name === key);
        
        if (initialData) {
          // This is an update - only include fields that have actually changed
          const originalValue = initialData[key];
          const hasChanged = value !== originalValue;
          
          if (hasChanged) {
            // Handle the changed value
            if (value === '' || value === null || value === undefined) {
              cleanedData[key] = null;
            } else {
              // Handle number fields - convert empty strings to null, ensure numbers are valid
              if (fieldConfig?.type === 'number') {
                if (value === '' || value === null || value === undefined) {
                  cleanedData[key] = null;
                } else {
                  const numValue = Number(value);
                  cleanedData[key] = isNaN(numValue) ? null : numValue;
                }
              } else {
                cleanedData[key] = value;
              }
            }
          }
          // If field hasn't changed, don't include it in the update
        } else {
          // This is a create - only include non-empty values
          if (value !== undefined && value !== null && value !== '') {
            // Handle number fields - ensure they're valid numbers
            if (fieldConfig?.type === 'number') {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                cleanedData[key] = numValue;
              }
            } else {
              cleanedData[key] = value;
            }
          }
        }
      });
      
      console.log('Cleaned data:', cleanedData);
      console.log('Table:', table);
      console.log('Is update:', !!initialData);
      
      // For updates, ensure we have at least one field to update
      if (initialData && Object.keys(cleanedData).length === 0) {
        const error = new Error('No fields have been changed');
        console.error('No fields have been changed');
        await AppLogger.error('EnhancedForm', 'validation', 'No fields changed', error, { 
          table, 
          originalData: initialData,
          formData: data 
        });
        alert('Please make changes to at least one field before saving');
        return;
      }
      
      // Log specific field processing for debugging
      if (table === 'entities') {
        const numberFields = config.fields.filter((f: FieldConfig) => f.type === 'number');
        console.log('Number fields in entities:', numberFields.map((f: FieldConfig) => f.name));
        numberFields.forEach((field: FieldConfig) => {
          if (cleanedData[field.name] !== undefined) {
            console.log(`Field ${field.name}:`, {
              original: initialData?.[field.name],
              cleaned: cleanedData[field.name],
              type: typeof cleanedData[field.name]
            });
          }
        });
        
        // Additional validation for entities table - only validate fields being updated
        const validationErrors: string[] = [];
        numberFields.forEach((field: FieldConfig) => {
          if (cleanedData[field.name] !== undefined) {
            const value = cleanedData[field.name];
            if (value !== null && value !== undefined && (typeof value !== 'number' || isNaN(value))) {
              validationErrors.push(`${field.name} must be a valid number or empty`);
            }
          }
        });
        
        if (validationErrors.length > 0) {
          const error = new Error(`Validation errors: ${validationErrors.join(', ')}`);
          console.error('Validation errors:', validationErrors);
          await AppLogger.error('EnhancedForm', 'validation', 'Number field validation failed', error, { 
            table, 
            validationErrors,
            cleanedData 
          });
          alert(`Validation errors:\n${validationErrors.join('\n')}`);
          return;
        }
      }
      
      // Log cleaned data
      await AppLogger.debug('EnhancedForm', 'data_cleaning', `Data cleaned for ${table}`, { 
        table, 
        isUpdate: !!initialData, 
        cleanedData 
      });
      
      // Ensure we have at least the required fields based on table type
      console.log('Validating table:', table);
      console.log('Cleaned data:', cleanedData);
      
      if (table === 'entities') {
        // For entities, require name and type only if they're being updated
        if (cleanedData.name !== undefined && !cleanedData.name) {
          const error = new Error('Entity name cannot be empty');
          console.error('Entity name cannot be empty');
          await AppLogger.error('EnhancedForm', 'validation', 'Entity name empty', error, { 
            table, 
            cleanedData
          });
          alert('Entity name cannot be empty');
          return;
        }
        if (cleanedData.type !== undefined && !cleanedData.type) {
          const error = new Error('Entity type cannot be empty');
          console.error('Entity type cannot be empty');
          await AppLogger.error('EnhancedForm', 'validation', 'Entity type empty', error, { 
            table, 
            cleanedData
          });
          alert('Entity type cannot be empty');
          return;
        }
      } else {
        // For other tables, only require fields if they're being updated
        if (Object.keys(cleanedData).length > 0) {
          // Check if any of the updated fields have valid data
          const hasValidData = Object.values(cleanedData).some(value => 
            value !== null && value !== undefined && value !== ''
          );
          
          if (!hasValidData) {
            const error = new Error('Please provide valid data for at least one field');
            console.error('No valid data provided');
            await AppLogger.error('EnhancedForm', 'validation', 'No valid data provided', error, { 
              table, 
              cleanedData
            });
            alert('Please provide valid data for at least one field');
            return;
          }
        }
      }
      
      console.log('=== ABOUT TO CALL onSubmit ===');
      console.log('Final cleaned data being sent to database:', JSON.stringify(cleanedData, null, 2));
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
      
      // Check if this is a redirect error (which is actually success)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        console.log('Form submission successful - redirecting...');
        await AppLogger.info('EnhancedForm', 'form_submission_success', 'Form submitted successfully (redirect)', { 
          table, 
          rawData: data 
        });
        return; // Don't show error alert for successful redirects
      }
      
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
        return <Input {...formField} className="transition-none" />;
      
      case "textarea":
        // Make description fields span full width and be larger
        const isDescriptionField = field.name === 'description' || field.name === 'short_description';
        const rows = isDescriptionField ? 6 : 3;
        const className = isDescriptionField ? "col-span-2 transition-none" : "transition-none";
        return <Textarea {...formField} rows={rows} className={className} />;
      
      case "number":
        return <Input type="number" step="any" {...formField} className="transition-none" />;
      
      case "date":
        return <Input type="date" {...formField} className="transition-none" />;
      
      case "select":
        return (
          <Select onValueChange={formField.onChange} defaultValue={formField.value}>
            <SelectTrigger className="transition-none">
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
        return <Input {...formField} className="transition-none" />;
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

  // Helper function to check if a field has changed
  const hasFieldChanged = (fieldName: string): boolean => {
    if (!initialData) return false;
    const currentValue = form.watch(fieldName);
    const originalValue = initialData[fieldName];
    return currentValue !== originalValue;
  };

  // Get count of changed fields
  const changedFieldsCount = config.fields.filter((field: FieldConfig) => hasFieldChanged(field.name)).length;

  return (
          <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.error('Form validation errors on submit:', errors);
          AppLogger.error('EnhancedForm', 'submit_validation_failed', 'Form submission blocked by validation errors', new Error('Validation failed'), { 
            table, 
            errors 
          });
        })} className="space-y-6">
        
        {/* Show changed fields indicator for updates */}
        {initialData && changedFieldsCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <span className="font-medium">{changedFieldsCount}</span> field{changedFieldsCount !== 1 ? 's' : ''} changed
            </div>
          </div>
        )}
        
        {/* Main fields (not legal info) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.fields.filter((f: FieldConfig) => !legalInfoFields.includes(f.name) && !texasFields.includes(f.name) && !officerFields.flat().includes(f.name)).map((field: FieldConfig) => {
            // For foreign key fields, only show them if they're not already set (for creates)
            // For updates, foreign key fields are typically hidden since they shouldn't change
            if (field.type === "fk" && initialData && initialData[field.name]) return null;
            
            // Make description fields span full width
            const isDescriptionField = field.name === 'description' || field.name === 'short_description';
            const fieldClassName = isDescriptionField ? "col-span-2" : "";
            
            return (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem className={fieldClassName}>
                    <FormLabel className="capitalize font-medium">
                      {field.label || field.name.replace(/_/g, ' ')}
                      {field.type === "fk" && <Badge variant="outline" className="ml-2 text-xs">Related</Badge>}
                      {initialData && hasFieldChanged(field.name) && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">Changed</Badge>
                      )}
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
        
        {/* Legal Info Accordion - Only show for entities table */}
        {table === 'entities' && (
          <Accordion type="single" collapsible defaultValue="legal-info">
            <AccordionItem value="legal-info">
              <AccordionTrigger className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-lg px-4 py-2 transition-none">Legal Information for the entity</AccordionTrigger>
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
                      <div key={idx} className="border rounded p-3 mb-2 transition-none">
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
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            className="min-w-[100px]"
            disabled={initialData && changedFieldsCount === 0}
          >
            {initialData ? (
              changedFieldsCount > 0 ? `Update (${changedFieldsCount})` : 'No Changes'
            ) : (
              submitLabel
            )}
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
        <div className="flex items-center justify-between p-2 border rounded-md bg-background transition-none">
          <span className="text-sm">{selectedOption.display}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0 transition-none"
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
            className="pr-8 transition-none"
          />
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      {isOpen && !selectedOption && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto transition-none">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm transition-none"
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