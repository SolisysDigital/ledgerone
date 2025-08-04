import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Plus } from 'lucide-react';
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
    <div className={STYLES.TABLES.CONTAINER}>
      <table className={STYLES.TABLES.STANDARD}>
        <thead>
          <tr className={STYLES.TABLES.HEADER_ROW}>
            {columns.map((column) => (
              <th key={column.key} className={STYLES.TABLES.HEADER_CELL}>
                {column.label}
              </th>
            ))}
            <th className={`${STYLES.TABLES.HEADER_CELL} text-right`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className={STYLES.ANIMATIONS.STAGGER_ANIMATE}>
          {data.map((record, index) => (
            <tr 
              key={record.id} 
              className={`${STYLES.TABLES.DATA_ROW} border-b border-slate-200 ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className={STYLES.TABLES.DATA_CELL}>
                  {column.render 
                    ? column.render(record[column.key], record)
                    : getDisplayValue(record, column.key)
                  }
                </td>
              ))}
              <td className={STYLES.TABLES.ACTIONS_CELL}>
                <div className={`flex items-center justify-end ${SPACING.BUTTON_SPACING}`}>
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(record.id)}
                      className={STYLES.BUTTONS.GHOST}
                    >
                      <Eye className={ICONS.EYE} />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(record.id)}
                      className={STYLES.BUTTONS.GHOST}
                    >
                      <Edit className={ICONS.EDIT} />
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