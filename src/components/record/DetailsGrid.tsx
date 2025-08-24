import React from "react";
import { DetailTile } from "./DetailTile";

type DetailsGridProps<T> = {
  data: T;
  displayFields: Array<keyof T>;
  fieldLabels?: Record<string, string>;
  fieldFormatters?: Record<string, (value: any) => React.ReactNode>;
};

export function DetailsGrid<T extends Record<string, any>>({ 
  data, 
  displayFields, 
  fieldLabels = {},
  fieldFormatters = {}
}: DetailsGridProps<T>) {
  const formatFieldValue = (fieldName: string, value: any): React.ReactNode => {
    // Check if there's a custom formatter for this field
    if (fieldFormatters[fieldName]) {
      return fieldFormatters[fieldName](value);
    }

    // Default formatting based on value type
    if (value === null || value === undefined || value === '') {
      return null; // Will show as "—" in DetailTile
    }

    if (typeof value === 'number') {
      // Special handling for balance fields
      if (fieldName.includes('balance')) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      return value.toLocaleString();
    }

    if (typeof value === 'string' && value.length > 100) {
      return `${value.substring(0, 100)}...`;
    }

    return value;
  };

  const getFieldLabel = (fieldName: string): string => {
    return fieldLabels[fieldName] || fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Check if a field should span full width
  const shouldSpanFullWidth = (fieldName: string): boolean => {
    return fieldName === 'description' || fieldName === 'short_description';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {displayFields.map((fieldName) => {
        const value = data[fieldName];
        const formattedValue = formatFieldValue(fieldName as string, value);
        const isFullWidth = shouldSpanFullWidth(fieldName as string);
        
        return (
          <DetailTile
            key={fieldName as string}
            label={getFieldLabel(fieldName as string)}
            value={formattedValue}
            className={isFullWidth ? "col-span-2" : ""}
          />
        );
      })}
    </div>
  );
}
