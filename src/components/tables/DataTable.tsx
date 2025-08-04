import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Plus, User, Clock, ExternalLink } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import { STYLES, ICONS, SPACING } from '@/styles/constants';

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  tableName: string;
  loading?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DataTable({ 
  data, 
  columns, 
  tableName,
  loading = false,
  onView, 
  onEdit, 
  onDelete 
}: DataTableProps) {
  const getDisplayValue = (record: any, fieldName: string) => {
    const value = record[fieldName];
    if (value === null || value === undefined) return "-";
    return String(value);
  };

  const renderEnhancedCell = (column: Column, record: any) => {
    if (column.render) {
      return column.render(record[column.key], record);
    }

    const value = getDisplayValue(record, column.key);
    
    // Enhanced cell rendering based on column type
    if (column.key === 'name' || column.key === 'email' || column.key === 'phone_number') {
      return (
        <div className="space-y-1">
          <div className="font-medium text-teal-800">{value}</div>
          <div className="text-xs text-muted-foreground">ID: {record.id}</div>
        </div>
      );
    }

    if (column.key === 'description' || column.key === 'label') {
      return (
        <div className="max-w-md">
          <p className="font-medium text-teal-800 mb-1">{value}</p>
          {record.description && record.description !== value && (
            <p className="text-xs text-muted-foreground">{record.description}</p>
          )}
        </div>
      );
    }

    if (column.key === 'created_at' || column.key === 'updated_at') {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-teal-800">{value}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {value}
          </div>
        </div>
      );
    }

    // Default enhanced cell
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-muted/30 rounded flex items-center justify-center">
          <User className="h-3 w-3 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-teal-800">{value}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={STYLES.STATES.LOADING}>
        <div className={ICONS.LOADER} />
        <span className={STYLES.STATES.LOADING_TEXT}>Loading records...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={STYLES.STATES.EMPTY}>
        <div className={STYLES.STATES.EMPTY_TEXT}>No records found</div>
        <Button asChild className={STYLES.BUTTONS.PRIMARY}>
          <Link href={`/${tableName}/new`}>
            <Plus className={ICONS.PLUS} />
            Create First Record
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg">
      <table className="table-modern w-full">
        <thead>
          <tr className={STYLES.TABLES.HEADER_ROW}>
            {columns.map((column) => (
              <th key={column.key} className="font-semibold text-xs uppercase tracking-wider text-white p-4 text-left">
                {column.label}
              </th>
            ))}
            <th className="font-semibold text-xs uppercase tracking-wider text-white p-4 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr 
              key={record.id} 
              className={`hover:bg-muted/30 transition-colors duration-150 border-b border-teal-300 ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className="py-4">
                  {renderEnhancedCell(column, record)}
                </td>
              ))}
              <td className="py-4">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(record.id)}
                      className="hover:bg-muted/30 transition-colors duration-150"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(record.id)}
                      className="hover:bg-muted/30 transition-colors duration-150"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <DeleteButton
                      table={tableName}
                      id={record.id}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 