import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { SkipLink } from '../../components/VisuallyHidden';
import { useI18n } from '../../i18n/I18nProvider';
import { statusLayoutVariants, type StatusLayoutVariantProps } from './status-layout.variants';

interface StatusLayoutBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title' | 'children'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Built-in h1 focus target. Adds tabIndex=-1 only when supplied; use the slot's own ref for a custom heading. */
  titleRef?: Ref<HTMLHeadingElement>;
  /** Short status above the title: "404", "403 · Forbidden", "Maintenance". */
  code?: ReactNode;
  description?: ReactNode;
  /** Neutral icon in a halo, when there is no illustration. */
  icon?: LucideIcon;
  /** Custom illustration (SVG, image). Decorative unless it carries its own alt text. */
  illustration?: ReactNode;
  /** The way forward (a primary Button). Comes first in tab order. */
  primaryAction?: ReactNode;
  /** Alternative (go back, contact support). */
  secondaryAction?: ReactNode;
  /** Extra content below the actions (search, request id, status list). */
  children?: ReactNode;
  /** Minimal top bar (usually just the Logo). */
  header?: ReactNode;
  /** Bottom line (status page, support, request id). */
  footer?: ReactNode;
  /** Colour of the code and icon halo. Brand green is for positive states only (e.g. "Back online"). */
  tone?: StatusLayoutVariantProps['tone'];
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

export type StatusLayoutProps = StatusLayoutBaseProps & (
  | { /** The message, rendered as the page h1 when the slot is empty. */ title: ReactNode; heading?: null }
  | { /** Replaces the built-in title; supply exactly one h1. */ heading: NonNullable<ReactNode>; title?: never }
);

/**
 * Full-page status (404 · 403 · 500 · maintenance): a centred message with an illustration or
 * icon, a primary and a secondary action, and minimal chrome. The primary action comes first in
 * the DOM and in tab order.
 */
export function StatusLayout({
  code,
  title,
  heading,
  titleRef,
  description,
  icon: Icon,
  illustration,
  primaryAction,
  secondaryAction,
  children,
  header,
  footer,
  tone,
  mainId = 'main',
  skipLinkLabel: skipLinkLabelProp,
  fullScreen = false,
  className,
  ...props
}: StatusLayoutProps) {
  const { t } = useI18n();
  const skipLinkLabel = skipLinkLabelProp ?? t('skip.content');
  const s = statusLayoutVariants({ tone, fullScreen });
  return (
    <div className={cn(s.root(), className)} {...props}>
      <SkipLink targetId={mainId} className={s.skipLink()}>
        {skipLinkLabel}
      </SkipLink>
      {header != null && <header className={s.header()}>{header}</header>}
      <main id={mainId} tabIndex={-1} className={s.main()}>
        <div className={s.content()}>
          {illustration != null ? (
            <div className={s.illustration()}>{illustration}</div>
          ) : (
            Icon && (
              <div className={s.illustration()}>
                <span className={s.iconHalo()}>
                  <Icon size={26} aria-hidden />
                </span>
              </div>
            )
          )}
          {code != null && <p className={s.code()}>{code}</p>}
          {heading != null ? (
            <div className={s.heading()}>{heading}</div>
          ) : (
            <h1 ref={titleRef} tabIndex={titleRef != null ? -1 : undefined} className={s.title()}>{title}</h1>
          )}
          {description != null && <p className={s.description()}>{description}</p>}
          {(primaryAction != null || secondaryAction != null) && (
            <div className={s.actions()}>
              {primaryAction}
              {secondaryAction}
            </div>
          )}
          {children != null && <div className={s.extra()}>{children}</div>}
        </div>
      </main>
      {footer != null && <footer className={s.footer()}>{footer}</footer>}
    </div>
  );
}
