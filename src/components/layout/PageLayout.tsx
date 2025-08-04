import React from 'react';
import { STYLES } from '@/styles/constants';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

export function PageLayout({ title, subtitle, children, actionButton }: PageLayoutProps) {
  return (
    <div className={STYLES.LAYOUT.PAGE_CONTAINER}>
      <div className={STYLES.LAYOUT.PAGE_HEADER}>
        <div>
          <h1 className={STYLES.LAYOUT.PAGE_TITLE}>{title}</h1>
          {subtitle && <p className={STYLES.LAYOUT.PAGE_SUBTITLE}>{subtitle}</p>}
        </div>
        {actionButton}
      </div>
      {children}
    </div>
  );
} 