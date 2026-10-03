import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger, cn } from '@gntik-ai/ui';
import { ExternalLink, Globe } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { citationStyles as s } from './citation.variants';

export interface CitationSource {
  /** Source title. */
  title: string;
  /** Where it lives; shown as its host name and linked. */
  url?: string;
  /** Short excerpt that supports the claim. */
  snippet?: string;
  /** Publisher or site name; defaults to the URL host. */
  publisher?: string;
}

/** Host name of a URL ("docs.example.com"), or undefined if it cannot be parsed. */
export function sourceHost(url?: string) {
  if (!url) return undefined;
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/** Only http(s) sources become links. */
export function safeSourceUrl(url?: string) {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

export interface CitationProps {
  /** 1-based number shown in the marker. */
  index: number;
  source: CitationSource;
  /** Hover delay before the preview opens (keyboard and click open it immediately). */
  delay?: number;
  className?: string;
}

/**
 * Inline numbered reference ([1]). Hovering, focusing + Enter or clicking opens a preview
 * card with the title, host, snippet and a link to the source.
 */
export function Citation({ index, source, delay = 200, className }: CitationProps) {
  const host = source.publisher ?? sourceHost(source.url);
  const href = safeSourceUrl(source.url);
  return (
    <Popover>
      <PopoverTrigger openOnHover delay={delay} aria-label={`Source ${index}: ${source.title}`} className={cn(s.trigger, className)}>
        {index}
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className={s.popup}>
        <div className={s.head}>
          <span className={s.index}>{index}</span>
          <Globe size={12} aria-hidden />
          {host && <span className="truncate">{host}</span>}
        </div>
        <PopoverTitle className={s.title}>{source.title}</PopoverTitle>
        {source.snippet && <PopoverDescription className={s.snippet}>{source.snippet}</PopoverDescription>}
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={s.open}>
            Open source
            <ExternalLink size={12} aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </PopoverContent>
    </Popover>
  );
}

export interface CitationListProps {
  sources: CitationSource[];
  /** Visible heading; also the list's accessible name. */
  heading?: ReactNode;
  className?: string;
}

/** Numbered list of the sources cited in a reply, matching the inline markers. */
export function CitationList({ sources, heading = 'Sources', className }: CitationListProps) {
  const headingId = useId();
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby={headingId} className={className}>
      <h3 id={headingId} className={s.heading}>
        {heading}
      </h3>
      <ol className={s.list}>
        {sources.map((src, i) => {
          const href = safeSourceUrl(src.url);
          const host = src.publisher ?? sourceHost(src.url);
          return (
            <li key={`${i}-${src.title}`} className={s.item}>
              <span className={s.index} aria-hidden>
                {i + 1}
              </span>
              <div className={s.itemBody}>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={s.itemTitle}>
                    {src.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="text-[13px] font-medium text-foreground">{src.title}</span>
                )}
                {host && <div className={s.itemHost}>{host}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
