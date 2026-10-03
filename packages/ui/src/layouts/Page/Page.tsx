import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { pageVariants, type PageVariantProps } from './page.variants';

export interface PageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Max content width: narrow 640 · default 1120 · wide 1440 · full. */
  width?: PageVariantProps['width'];
  /** Custom header (e.g. the blocks PageHeader). Replaces title / description / actions. */
  header?: ReactNode;
  /** Simple header: renders an <h1>. */
  title?: ReactNode;
  description?: ReactNode;
  /** Buttons on the right of the simple header. */
  actions?: ReactNode;
  /** Sticky bar at the bottom of the page (save / cancel, bulk actions). */
  actionBar?: ReactNode;
  /** Accessible name of the action bar region. */
  actionBarLabel?: string;
  children?: ReactNode;
}

/**
 * A page inside any shell (SidebarLayout, StackedLayout…): header · body · optional sticky action
 * bar, centered at one of four widths. It owns no <main>; the shell does.
 */
export function Page({
  width = 'default',
  header,
  title,
  description,
  actions,
  actionBar,
  actionBarLabel = 'Page actions',
  className,
  children,
  ...props
}: PageProps) {
  const s = pageVariants({ width });
  const simpleHeader = title || description || actions;
  return (
    <div data-width={width} className={cn(s.root(), className)} {...props}>
      <div className={s.inner()}>
        {header ??
          (simpleHeader && (
            <div className={s.header()}>
              <div className={s.titles()}>
                {title && <h1 className={s.title()}>{title}</h1>}
                {description && <p className={s.description()}>{description}</p>}
              </div>
              {actions && <div className={s.actions()}>{actions}</div>}
            </div>
          ))}
        <div className={s.body()}>{children}</div>
      </div>
      {actionBar && (
        <div role="region" aria-label={actionBarLabel} className={s.actionBar()}>
          <div className={s.actionBarInner()}>{actionBar}</div>
        </div>
      )}
    </div>
  );
}
