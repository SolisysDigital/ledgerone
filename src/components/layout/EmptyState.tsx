import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { STYLES, ICONS } from '@/styles/constants';

interface EmptyStateProps {
  message?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  message = "No records found", 
  actionText = "Create First Record",
  actionHref,
  onAction 
}: EmptyStateProps) {
  return (
    <div className={STYLES.STATES.EMPTY}>
      <div className={STYLES.STATES.EMPTY_TEXT}>{message}</div>
      {actionHref ? (
        <Button asChild className={STYLES.BUTTONS.PRIMARY}>
          <Link href={actionHref}>
            <Plus className={ICONS.PLUS} />
            {actionText}
          </Link>
        </Button>
      ) : onAction ? (
        <Button onClick={onAction} className={STYLES.BUTTONS.PRIMARY}>
          <Plus className={ICONS.PLUS} />
          {actionText}
        </Button>
      ) : null}
    </div>
  );
} 