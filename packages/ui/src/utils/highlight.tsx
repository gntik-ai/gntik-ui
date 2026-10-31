import type { ReactNode } from 'react';
import { matchRanges } from './match-text';
import { tv } from './tv';

const s = tv({ slots: { mark: 'rounded-[3px] bg-warning/16 text-warning-chip-text' } })();

/** Canonical mark style, shared with the JsonViewer variants. */
export const highlightMarkClass = s.mark();

/** Shared internal plain-text highlight, retaining original Unicode offsets and styling. */
export function highlight(text: string, query: string, locale?: string): ReactNode {
  const out: ReactNode[] = [];
  let from = 0;
  for (const [start, end] of matchRanges(text, query, { locale })) {
    out.push(text.slice(from, start));
    out.push(
      <mark key={start} className={s.mark()}>
        {text.slice(start, end)}
      </mark>,
    );
    from = end;
  }
  out.push(text.slice(from));
  return out;
}
