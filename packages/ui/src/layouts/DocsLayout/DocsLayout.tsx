import { useRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '../../components/Collapsible';
import { SkipLink } from '../../components/VisuallyHidden';
import { docsLayoutVariants } from './docs-layout.variants';
import { Outline, type OutlineItem } from './Outline';

export interface DocsLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** The article (headings with ids matching `toc`). */
  children?: ReactNode;
  /** Top bar (logo, search, version switcher, theme, MobileNav trigger). */
  header?: ReactNode;
  /** Left navigation — usually a NavList (it provides its own `<nav>` landmark). Hidden below `lg`. */
  nav?: ReactNode;
  /** Table of contents entries; renders the Outline (scroll-spy) on the right and a Collapsible copy below `lg`. */
  toc?: OutlineItem[];
  /** Heading / accessible name of the table of contents. */
  tocLabel?: string;
  /** Replaces the right column (when not using `toc`). */
  aside?: ReactNode;
  /** After the article (previous / next links, feedback, last updated). */
  footer?: ReactNode;
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

/**
 * Documentation shell: top bar · left nav · article · right table of contents with scroll-spy
 * (Outline). The article column scrolls on its own and is the Outline's scroll root. Below `lg`
 * the nav hides and the table of contents moves into a Collapsible above the article.
 */
export function DocsLayout({
  children,
  header,
  nav,
  toc,
  tocLabel = 'On this page',
  aside,
  footer,
  mainId = 'main',
  skipLinkLabel = 'Skip to content',
  fullScreen = false,
  className,
  ...props
}: DocsLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const s = docsLayoutVariants({ fullScreen });
  const hasToc = toc != null && toc.length > 0;
  return (
    <div className={cn(s.root(), className)} {...props}>
      <SkipLink targetId={mainId} className={s.skipLink()}>
        {skipLinkLabel}
      </SkipLink>
      {header != null && <header className={s.header()}>{header}</header>}
      <div className={s.body()}>
        {nav != null && <div className={s.nav()}>{nav}</div>}
        <main ref={mainRef} id={mainId} tabIndex={-1} className={s.main()}>
          <div className={s.column()}>
            {hasToc && (
              <Collapsible variant="row" className={s.mobileToc()}>
                <CollapsibleTrigger>{tocLabel}</CollapsibleTrigger>
                <CollapsiblePanel>
                  <Outline items={toc} label={tocLabel} landmark={false} hideHeading scrollRootRef={mainRef} />
                </CollapsiblePanel>
              </Collapsible>
            )}
            <article className={s.article()}>{children}</article>
            {footer != null && <div className={s.footer()}>{footer}</div>}
          </div>
        </main>
        {(hasToc || aside != null) && (
          <div className={s.toc()}>{aside ?? (hasToc && <Outline items={toc} label={tocLabel} scrollRootRef={mainRef} />)}</div>
        )}
      </div>
    </div>
  );
}
