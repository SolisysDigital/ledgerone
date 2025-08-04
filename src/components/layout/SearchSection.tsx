import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { STYLES, ICONS, SPACING } from '@/styles/constants';

interface SearchSectionProps {
  placeholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilter?: () => void;
}

export function SearchSection({ 
  placeholder, 
  searchQuery, 
  onSearchChange, 
  onFilter 
}: SearchSectionProps) {
  return (
    <Card className={STYLES.COLORS.CARD_STANDARD}>
      <CardHeader>
        <CardTitle className={STYLES.LAYOUT.CARD_HEADER}>
          <Search className={ICONS.SEARCH} />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={SPACING.ITEM_SPACING}>
          <div className={STYLES.FORMS.SEARCH_CONTAINER}>
            <Search className={STYLES.FORMS.SEARCH_ICON} />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={STYLES.FORMS.SEARCH_INPUT}
            />
          </div>
          {onFilter && (
            <Button variant="outline" className={STYLES.BUTTONS.SECONDARY}>
              <Filter className={ICONS.FILTER} />
              Filter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 