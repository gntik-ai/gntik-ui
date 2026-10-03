import { useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { NavList, type NavGroup, type NavItem } from '../../components/NavList';
import { navItemKey } from '../../components/NavList/nav-context';
import { SimpleSelect } from '../../components/Select';
import { SkipLink } from '../../components/VisuallyHidden';
import { settingsLayoutVariants, type SettingsLayoutVariantProps } from './settings-layout.variants';

/** Every selectable (leaf) item, depth-first. */
function flattenLeaves(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.items?.length ? flattenLeaves(item.items) : [item]));
}

function markCurrent(items: NavItem[], value: string | undefined): NavItem[] {
  return items.map((item) =>
    item.items?.length ? { ...item, items: markCurrent(item.items, value) } : { ...item, current: item.current ?? navItemKey(item) === value },
  );
}

export interface SettingsLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title' | 'defaultValue'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Section navigation (NavList groups). Items are keyed by `id`, then `href`, then `label`. */
  groups: NavGroup[];
  /** Key of the current section (controlled). */
  value?: string;
  /** Initial section (uncontrolled). Defaults to the first item. */
  defaultValue?: string;
  /** Called when a section is chosen from the nav or the small-screen Select. Route here for `href` sections. */
  onValueChange?: (value: string, item: NavItem) => void;
  /** Heading above the section nav and accessible name of the nav. */
  navLabel?: string;
  /** Page title (an `<h1>`). */
  title?: ReactNode;
  description?: ReactNode;
  /** Replaces the default title block. */
  header?: ReactNode;
  /** Form sections of the current page. */
  children?: ReactNode;
  /** Sticky bar at the bottom of the content (Discard · Save changes). */
  saveBar?: ReactNode;
  /** Max width of the content column. */
  width?: SettingsLayoutVariantProps['width'];
  /**
   * Inside an app shell that already owns <main> and the skip link (SidebarLayout, StackedLayout):
   * render the content region as a plain <div> and drop this layout's skip link.
   */
  embedded?: boolean;
  /** Label of the small-screen section Select. */
  selectLabel?: string;
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

/**
 * Settings shell: section nav (NavList) on the left · content with form sections · sticky save bar.
 * Below `lg` the nav becomes a Select at the top of the page. The current section is
 * controllable (`value` / `onValueChange`).
 */
export function SettingsLayout({
  groups,
  value: valueProp,
  defaultValue,
  onValueChange,
  navLabel = 'Settings',
  title,
  description,
  header,
  children,
  saveBar,
  width,
  selectLabel = 'Settings section',
  embedded = false,
  mainId = 'main',
  skipLinkLabel = 'Skip to content',
  fullScreen = false,
  className,
  ...props
}: SettingsLayoutProps) {
  const MainTag = embedded ? 'div' : 'main';
  const leaves = groups.flatMap((g) => flattenLeaves(g.items));
  const firstKey = leaves[0] ? navItemKey(leaves[0]) : undefined;
  const [inner, setInner] = useState(defaultValue ?? firstKey);
  const value = valueProp ?? inner;
  const s = settingsLayoutVariants({ width, fullScreen });

  const select = (key: string, item: NavItem) => {
    if (valueProp === undefined) setInner(key);
    onValueChange?.(key, item);
  };
  const marked = groups.map((g) => ({ ...g, items: markCurrent(g.items, value) }));
  const options = leaves.filter((i) => !i.disabled).map((i) => ({ value: navItemKey(i), label: i.label }));

  return (
    <div className={cn(s.root(), className)} {...props}>
      {!embedded && (
        <SkipLink targetId={mainId} className={s.skipLink()}>
          {skipLinkLabel}
        </SkipLink>
      )}
      <div className={s.sidebar()}>
        <p className={s.sidebarHeading()} aria-hidden>
          {navLabel}
        </p>
        <NavList label={navLabel} groups={marked} onNavigate={(item) => select(navItemKey(item), item)} />
      </div>
      <div className={s.compactNav()}>
        <SimpleSelect
          aria-label={selectLabel}
          items={options}
          value={value ?? null}
          onValueChange={(key) => {
            const item = leaves.find((i) => navItemKey(i) === key);
            if (key != null && item) select(key, item);
          }}
          className="w-full"
        />
      </div>
      <MainTag id={mainId} tabIndex={-1} className={s.main()}>
        <div className={s.content()}>
          {header ??
            (title != null && (
              <div className={s.header()}>
                <h1 className={s.title()}>{title}</h1>
                {description != null && <p className={s.description()}>{description}</p>}
              </div>
            ))}
          {children}
        </div>
        {saveBar != null && <div className={s.saveBar()}>{saveBar}</div>}
      </MainTag>
    </div>
  );
}
