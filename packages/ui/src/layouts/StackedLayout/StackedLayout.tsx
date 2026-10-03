import { createElement, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useLinkComponent } from '../../components/Link';
import { MobileNav } from '../../components/MobileNav';
import { isNavItemCurrent, type NavItem } from '../../components/NavList';
import { SkipLink } from '../../components/VisuallyHidden';
import { useI18n } from '../../i18n/I18nProvider';
import { stackedLayoutVariants, type StackedLayoutVariantProps } from './stacked-layout.variants';

export interface StackedLayoutProps {
  className?: string;
  /** Logo or product name at the start of the navbar. */
  brand?: ReactNode;
  /** Primary links: a horizontal nav on large screens, a MobileNav drawer below lg. */
  links?: NavItem[];
  /** The current location; the link with this `href` gets aria-current="page". */
  currentHref?: string;
  /** Called when a link is activated (desktop or drawer). */
  onNavigate?: (item: NavItem) => void;
  /** Right side of the navbar: ⌘K, notifications, user menu… */
  actions?: ReactNode;
  /** Optional second row under the navbar, e.g. a Tabs sub-nav. */
  subnav?: ReactNode;
  /** Band above the content (pair with the blocks PageHeader). */
  pageHeader?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Max width of the centered content: narrow 640 · default 1120 · wide 1440 · full. */
  width?: StackedLayoutVariantProps['width'];
  /** Accessible name of the primary nav landmark (and of the mobile drawer). */
  navLabel?: string;
  /** Title of the mobile drawer. */
  mobileTitle?: ReactNode;
  /** Footer of the mobile drawer (e.g. a UserMenu). */
  mobileFooter?: ReactNode;
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

function DesktopLink({ item, current, className, onNavigate }: { item: NavItem; current: boolean; className: string; onNavigate?: (item: NavItem) => void }) {
  const RouterLink = useLinkComponent();
  const IconCmp = item.icon;
  const props = {
    className,
    href: item.href,
    'aria-current': current ? ('page' as const) : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      item.onClick?.(event);
      onNavigate?.(item);
    },
  };
  const content = (
    <>
      {IconCmp && <IconCmp size={16} aria-hidden />}
      {item.label}
    </>
  );
  if (!item.href) return <button type="button" {...props} disabled={item.disabled}>{content}</button>;
  return createElement(RouterLink ?? 'a', props, content);
}

/**
 * Top-navigation shell: navbar (brand · links · actions) · optional tab sub-nav · optional page
 * header band · centered content · footer. Below lg the links collapse into a MobileNav drawer.
 */
export function StackedLayout({
  className,
  brand,
  links = [],
  currentHref,
  onNavigate,
  actions,
  subnav,
  pageHeader,
  children,
  footer,
  width = 'default',
  navLabel: navLabelProp,
  mobileTitle,
  mobileFooter,
  mainId = 'main',
  skipLinkLabel: skipLinkLabelProp,
  fullScreen = false,
}: StackedLayoutProps) {
  const { t } = useI18n();
  const navLabel = navLabelProp ?? t('common.main');
  const skipLinkLabel = skipLinkLabelProp ?? t('skip.main');
  const s = stackedLayoutVariants({ fullScreen, width });
  return (
    <div className={cn(s.root(), className)}>
      <SkipLink targetId={mainId} className={s.skip()}>
        {skipLinkLabel}
      </SkipLink>
      <header className={s.header()}>
        <div className={s.bar()}>
          {links.length > 0 && (
            <MobileNav
              className={s.mobile()}
              groups={[{ items: links }]}
              currentHref={currentHref}
              title={mobileTitle}
              label={navLabel}
              footer={mobileFooter}
              onNavigate={onNavigate}
            />
          )}
          {brand && <div className={s.brand()}>{brand}</div>}
          {links.length > 0 && (
            <>
              <div aria-hidden className={s.divider()} />
              <nav aria-label={navLabel} className={s.nav()}>
                {links.map((item) => (
                  <DesktopLink
                    key={item.id ?? item.href ?? item.label}
                    item={item}
                    current={isNavItemCurrent(item, currentHref)}
                    className={s.link()}
                    onNavigate={onNavigate}
                  />
                ))}
              </nav>
            </>
          )}
          {actions && <div className={s.actions()}>{actions}</div>}
        </div>
        {subnav && <div className={s.subnav()}>{subnav}</div>}
      </header>
      {pageHeader && (
        <div className={s.pageHeader()}>
          <div className={s.pageHeaderInner()}>{pageHeader}</div>
        </div>
      )}
      <main id={mainId} tabIndex={-1} className={s.main()}>
        {children}
      </main>
      {footer && (
        <footer className={s.footer()}>
          <div className={s.footerInner()}>{footer}</div>
        </footer>
      )}
    </div>
  );
}
