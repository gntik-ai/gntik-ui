import { cn, useI18n } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { TRUNCATED_COLLECTION_PREVIEW } from './fixtures';

export interface TruncatedCollectionFooterProps {
  /** Number of records already loaded; never an estimated total. */
  visibleCount: number;
  /** More records exist beyond this first page, making the count a lower bound. */
  hasMore: boolean;
  /** Localized noun used in the default summary label and note. */
  noun?: string;
  /** Number-formatting locale; translated defaults come from I18nProvider. */
  locale?: string;
  /** Plain text label before the count; null hides it. */
  summaryLabel?: ReactNode;
  /** Replaces the entire count, including the lower-bound marker. Return plain text nodes. */
  formatCount?: (count: number, hasMore: boolean) => ReactNode;
  /** Plain text note or formatter, rendered only when hasMore is true. */
  truncationNote?: ((count: number) => ReactNode) | ReactNode;
  /** Id of the note for a consumer's aria-describedby reference. */
  noteId?: string;
  className?: string;
}

/** Static first-page summary with no total, navigation, focus stops or live region. */
export function TruncatedCollectionFooter({
  visibleCount = TRUNCATED_COLLECTION_PREVIEW.visibleCount,
  hasMore = TRUNCATED_COLLECTION_PREVIEW.hasMore,
  noun: nounProp,
  locale: localeProp,
  summaryLabel,
  formatCount,
  truncationNote,
  noteId,
  className,
}: TruncatedCollectionFooterProps) {
  const { t, locale: providerLocale } = useI18n();
  const locale = localeProp ?? providerLocale;
  const noun = nounProp ?? t('table.collectionNoun', { count: visibleCount });
  const formattedCount = visibleCount.toLocaleString(locale);
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="text-[12.5px] text-muted-foreground tabular-nums">
        {summaryLabel === undefined ? t('table.visibleCount', { noun }) : summaryLabel}{' '}
        <span className="font-mono text-foreground">
          {formatCount ? formatCount(visibleCount, hasMore) : `${formattedCount}${hasMore ? '+' : ''}`}
        </span>
      </p>
      {hasMore && (
        <p id={noteId} className="text-[12.5px] text-muted-foreground">
          {typeof truncationNote === 'function'
            ? truncationNote(visibleCount)
            : truncationNote === undefined
              ? t('table.truncatedNote', { count: visibleCount, formattedCount, noun })
              : truncationNote}
        </p>
      )}
    </div>
  );
}
