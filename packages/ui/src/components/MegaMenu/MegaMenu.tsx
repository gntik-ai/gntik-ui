import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { ChevronDown } from 'lucide-react';
import { createElement, useId, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useLinkComponent } from '../Link';
import type { NavIcon, NavItem } from '../NavList';
import { megaMenuVariants } from './mega-menu.variants';

export interface MegaMenuLink {
  label: string;
  href: string;
  description?: string;
  icon?: NavIcon;
  /** Marks the current page. Defaults to `href === currentHref`. */
  current?: boolean;
}

export interface MegaMenuSection {
  /** Column heading; also names the column's list. */
  title?: string;
  links: MegaMenuLink[];
}

export interface MegaMenuItem {
  id?: string;
  label: string;
  /** A plain top-level link (no panel). */
  href?: string;
  current?: boolean;
  /** Columns of the panel; an item with sections becomes a panel trigger. */
  sections?: MegaMenuSection[];
  /** Extra panel content beside the columns (a promo card, a changelog entry…). */
  featured?: ReactNode;
}

export interface MegaMenuProps {
  items: MegaMenuItem[];
  /** Accessible name of the navigation landmark. */
  label?: string;
  currentHref?: string;
  /** Called when any link is activated. */
  onNavigate?: (link: MegaMenuLink | MegaMenuItem) => void;
  className?: string;
}

const s = megaMenuVariants();
const isCurrent = (l: { href?: string; current?: boolean }, currentHref?: string) => l.current ?? (!!l.href && l.href === currentHref);

/** Flattens MegaMenu items into NavItems, e.g. to feed StackedLayout `links` / MobileNav on small screens. */
export function megaMenuNavItems(items: MegaMenuItem[]): NavItem[] {
  return items.map((it) => ({
    id: it.id,
    label: it.label,
    href: it.href,
    current: it.current,
    items: it.sections?.flatMap((sec) => sec.links.map((l) => ({ label: l.label, href: l.href, icon: l.icon, current: l.current }))),
  }));
}

function PanelLink({ link, currentHref, onNavigate }: { link: MegaMenuLink; currentHref?: string; onNavigate?: MegaMenuProps['onNavigate'] }) {
  const RouterLink = useLinkComponent();
  const current = isCurrent(link, currentHref);
  const IconCmp = link.icon;
  return (
    <NavigationMenu.Link
      href={link.href}
      active={current}
      closeOnClick
      aria-current={current ? 'page' : undefined}
      render={RouterLink ? (props) => createElement(RouterLink, props) : undefined}
      className={s.link()}
      onClick={() => onNavigate?.(link)}
    >
      {IconCmp && (
        <span className={s.linkIcon()} aria-hidden>
          <IconCmp size={15} aria-hidden />
        </span>
      )}
      <span className={s.linkText()}>
        <span className={s.linkLabel()}>{link.label}</span>
        {link.description && <span className={s.linkDescription()}>{link.description}</span>}
      </span>
    </NavigationMenu.Link>
  );
}

function Panel({ item, currentHref, onNavigate }: { item: MegaMenuItem; currentHref?: string; onNavigate?: MegaMenuProps['onNavigate'] }) {
  const id = useId();
  const sections = item.sections ?? [];
  const cols = { '--mega-cols': Math.min(sections.length, 3) } as CSSProperties;
  return (
    <NavigationMenu.Content className={s.content()}>
      <div className={s.columns()} style={cols}>
        {sections.map((sec, i) => (
          <div key={sec.title ?? i} className={s.section()}>
            {sec.title && (
              <p id={`${id}-${i}`} className={s.sectionTitle()}>
                {sec.title}
              </p>
            )}
            <ul className={s.links()} aria-labelledby={sec.title ? `${id}-${i}` : undefined}>
              {sec.links.map((link) => (
                <li key={link.href}>
                  <PanelLink link={link} currentHref={currentHref} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {item.featured != null && <div className={s.featured()}>{item.featured}</div>}
    </NavigationMenu.Content>
  );
}

function TopLink({ item, currentHref, onNavigate }: { item: MegaMenuItem; currentHref?: string; onNavigate?: MegaMenuProps['onNavigate'] }) {
  const RouterLink = useLinkComponent();
  const current = isCurrent(item, currentHref);
  return (
    <NavigationMenu.Link
      href={item.href}
      active={current}
      aria-current={current ? 'page' : undefined}
      render={RouterLink ? (props) => createElement(RouterLink, props) : undefined}
      className={s.trigger()}
      onClick={() => onNavigate?.(item)}
    >
      {item.label}
    </NavigationMenu.Link>
  );
}

/**
 * Top navigation with wide panels (Base UI Navigation Menu): items with `sections` open a panel
 * of link columns with descriptions (and optional featured content), plain items are links.
 * Router links come from LinkProvider; the trigger of the section holding the current page is
 * marked. Pair it with StackedLayout (as its sub-nav row) and `megaMenuNavItems` for MobileNav.
 */
export function MegaMenu({ items, label = 'Main', currentHref, onNavigate, className }: MegaMenuProps) {
  return (
    <NavigationMenu.Root aria-label={label} className={cn(s.root(), className)}>
      <NavigationMenu.List className={s.list()}>
        {items.map((item) => (
          <NavigationMenu.Item key={item.id ?? item.label} value={item.id ?? item.label}>
            {item.sections?.length ? (
              <>
                <NavigationMenu.Trigger
                  className={s.trigger()}
                  data-current={item.sections.some((sec) => sec.links.some((l) => isCurrent(l, currentHref))) || undefined}
                >
                  {item.label}
                  <NavigationMenu.Icon className={s.chevron()}>
                    <ChevronDown size={14} aria-hidden />
                  </NavigationMenu.Icon>
                </NavigationMenu.Trigger>
                <Panel item={item} currentHref={currentHref} onNavigate={onNavigate} />
              </>
            ) : (
              <TopLink item={item} currentHref={currentHref} onNavigate={onNavigate} />
            )}
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <NavigationMenu.Portal>
        <NavigationMenu.Positioner className={s.positioner()} sideOffset={8} align="start" collisionPadding={16} collisionAvoidance={{ side: 'none' }}>
          <NavigationMenu.Popup className={s.popup()}>
            <NavigationMenu.Viewport className={s.viewport()} />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
