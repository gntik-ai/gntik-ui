import type { ReactNode } from 'react';
import { Button, IconButton, useI18n } from '@gntik-ai/ui';
import { ChevronLeft, ChevronRight } from '@gntik-ai/icons';

export interface CalendarHeaderProps {
  titleId: string;
  title: string;
  subtitle?: string;
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  actions?: ReactNode;
}

/** Title + previous / today / next navigation + caller actions. */
export function CalendarHeader({ titleId, title, subtitle, prevLabel, nextLabel, onPrev, onNext, onToday, actions }: CalendarHeaderProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <h3 id={titleId} aria-live="polite" className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1">
          <IconButton icon={ChevronLeft} label={prevLabel} variant="secondary" size="sm" onClick={onPrev} />
          <Button variant="secondary" size="sm" onClick={onToday}>
            {t('calendar.today')}
          </Button>
          <IconButton icon={ChevronRight} label={nextLabel} variant="secondary" size="sm" onClick={onNext} />
        </div>
        {actions}
      </div>
    </div>
  );
}
