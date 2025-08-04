import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STYLES, ICONS, SPACING, SIZES } from '@/styles/constants';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalRecords, 
  onPageChange 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startRecord = ((currentPage - 1) * 10) + 1;
  const endRecord = Math.min(currentPage * 10, totalRecords);

  return (
    <div className={STYLES.PAGINATION.CONTAINER}>
      <div className={STYLES.PAGINATION.INFO}>
        Showing {startRecord} to {endRecord} of {totalRecords} results
      </div>
      <div className={STYLES.PAGINATION.CONTROLS}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={STYLES.PAGINATION.BUTTON}
        >
          <ChevronLeft className={ICONS.CHEVRON_LEFT} />
        </Button>
        <span className={SIZES.TEXT_SM}>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={STYLES.PAGINATION.BUTTON}
        >
          <ChevronRight className={ICONS.CHEVRON_RIGHT} />
        </Button>
      </div>
    </div>
  );
} 