import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { SkipLink } from '../../components/VisuallyHidden';
import { printLayoutVariants, type PrintLayoutVariantProps } from './print-layout.variants';

type PageSize = NonNullable<PrintLayoutVariantProps['size']>;
type PageMargin = NonNullable<PrintLayoutVariantProps['margin']>;

const PAGE_SIZE: Record<PageSize, string> = { a4: 'A4', letter: 'letter' };
const PAGE_MARGIN: Record<PageMargin, string> = { narrow: '12mm', normal: '20mm', wide: '28mm' };

export interface PrintLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Paper size: A4 (210 × 297 mm) or US Letter (8.5 × 11 in). */
  size?: PageSize;
  /** Page margins (12 · 20 · 28 mm), on screen as padding and in print as the `@page` margin. */
  margin?: PageMargin;
  /** Document header: logo, sender, document number. */
  header?: ReactNode;
  /** Document footer: legal line, page note. */
  footer?: ReactNode;
  /** The document body. Use `PageBreak` between pages. */
  children?: ReactNode;
  /** Emit an `@page` rule with the size and margin (one PrintLayout per printed page set). */
  pageRule?: boolean;
  /** Accessible name of the document. */
  'aria-label'?: string;
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

/**
 * Printable document frame (invoice, report, receipt). On screen it is a paper sheet (card surface,
 * border, flat shadow) at A4 or Letter size on a muted backdrop, in the current theme; in print
 * the chrome drops (no backdrop, border, shadow or outer padding) and `@page` sets size and margins.
 * Print with the light theme (ThemeProvider `defaultMode="light"` or `setMode('light')`).
 */
export function PrintLayout({
  size = 'a4',
  margin = 'normal',
  header,
  footer,
  children,
  pageRule = true,
  'aria-label': ariaLabel,
  mainId = 'main',
  skipLinkLabel = 'Skip to document',
  fullScreen = false,
  className,
  ...props
}: PrintLayoutProps) {
  const s = printLayoutVariants({ size, margin, fullScreen });
  return (
    <div className={cn(s.root(), className)} {...props}>
      {pageRule && <style>{`@page { size: ${PAGE_SIZE[size]}; margin: ${PAGE_MARGIN[margin]}; }`}</style>}
      <SkipLink targetId={mainId} className={s.skipLink()}>
        {skipLinkLabel}
      </SkipLink>
      <main id={mainId} tabIndex={-1} className={s.main()}>
        <article aria-label={ariaLabel} className={s.sheet()}>
          {header != null && <header className={s.header()}>{header}</header>}
          <div className={s.content()}>{children}</div>
          {footer != null && <footer className={s.footer()}>{footer}</footer>}
        </article>
      </main>
    </div>
  );
}

export interface PageBreakProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> {
  className?: string;
  /** On-screen marker text (hidden in print). Pass `null` to hide it. */
  label?: ReactNode;
}

/** Forces a new printed page; on screen it shows as a dashed divider. */
export function PageBreak({ className, label = 'Page break', ...props }: PageBreakProps) {
  const s = printLayoutVariants();
  return (
    <div aria-hidden className={cn(s.pageBreak(), className)} {...props}>
      {label != null && <span className={s.pageBreakLabel()}>{label}</span>}
    </div>
  );
}
