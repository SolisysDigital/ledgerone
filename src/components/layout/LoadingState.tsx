import React from 'react';
import { Loader2 } from 'lucide-react';
import { STYLES, ICONS } from '@/styles/constants';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading records..." }: LoadingStateProps) {
  return (
    <div className={STYLES.STATES.LOADING}>
      <Loader2 className={ICONS.LOADER} />
      <span className={STYLES.STATES.LOADING_TEXT}>{message}</span>
    </div>
  );
} 