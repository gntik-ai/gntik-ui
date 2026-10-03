import { Menu as MenuIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from '../../components/Button';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../components/Drawer';
import { SkipLink } from '../../components/VisuallyHidden';
import { sidebarLayoutVariants } from './sidebar-layout.variants';
import { useI18n } from '../../i18n/I18nProvider';
import { usePersistedCollapse } from './use-persisted-collapse';

/** State handed to sidebar slots, so they can adapt (icon rail) or close the mobile drawer. */
export interface SidebarSlotState {
  /** The desktop sidebar is collapsed (icon rail or off-canvas). Always false inside the drawer. */
  collapsed: boolean;
  /** The slot is rendered inside the small-screen drawer. */
  inDrawer: boolean;
  /** Closes the small-screen drawer (no-op on the desktop sidebar). Call it after navigating. */
  closeDrawer: () => void;
}

/** A sidebar slot: plain content, or a function of the sidebar state. */
export type SidebarSlot = ReactNode | ((state: SidebarSlotState) => ReactNode);

export interface SidebarLayoutContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const SidebarLayoutContext = createContext<SidebarLayoutContextValue | null>(null);

/** Sidebar state for anything rendered inside a SidebarLayout (e.g. a custom collapse button). */
export function useSidebarLayout(): SidebarLayoutContextValue {
  const ctx = useContext(SidebarLayoutContext);
  if (!ctx) throw new Error('useSidebarLayout must be used inside <SidebarLayout>.');
  return ctx;
}

export interface SidebarLayoutProps {
  className?: string;
  /** Sidebar body, usually a NavList (pass a function to get `collapsed` for the icon rail). */
  sidebar: SidebarSlot;
  /** Top of the sidebar: logo or workspace switcher. */
  sidebarHeader?: SidebarSlot;
  /** Bottom of the sidebar: usage, help, user. */
  sidebarFooter?: SidebarSlot;
  /** Topbar content after the menu / collapse buttons: breadcrumb, ⌘K, notifications, theme, user menu. */
  topbar?: ReactNode;
  /** Main content. */
  children?: ReactNode;
  /** What "collapsed" means on large screens: a 64px icon rail or a fully hidden sidebar. */
  collapseMode?: 'rail' | 'offcanvas';
  /** Shows the collapse toggle in the topbar (large screens). */
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Persists the uncontrolled collapsed state in localStorage under this key. */
  storageKey?: string;
  /** Small-screen drawer state. */
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  /** Accessible name of the sidebar landmark and of the small-screen drawer. */
  sidebarLabel?: string;
  /** `id` of <main>, target of the skip link. */
  mainId?: string;
  skipLinkLabel?: string;
  menuLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  /** Fill the viewport (h-dvh) instead of the container. */
  fullScreen?: boolean;
}

function renderSlot(slot: SidebarSlot, state: SidebarSlotState) {
  return typeof slot === 'function' ? slot(state) : slot;
}

/**
 * Application shell: collapsible sidebar (expanded, icon rail or off-canvas) · topbar · main.
 * Below `lg` the sidebar moves into a left Drawer opened from the topbar menu button.
 * Fills its container (`fullScreen` for h-dvh) and never uses fixed positioning.
 */
export function SidebarLayout({
  className,
  sidebar,
  sidebarHeader,
  sidebarFooter,
  topbar,
  children,
  collapseMode = 'rail',
  collapsible = true,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  storageKey,
  drawerOpen: drawerOpenProp,
  onDrawerOpenChange,
  sidebarLabel: sidebarLabelProp,
  mainId = 'main',
  skipLinkLabel: skipLinkLabelProp,
  menuLabel: menuLabelProp,
  collapseLabel: collapseLabelProp,
  expandLabel: expandLabelProp,
  fullScreen = false,
}: SidebarLayoutProps) {
  const { t } = useI18n();
  const sidebarLabel = sidebarLabelProp ?? t('nav.sidebar');
  const skipLinkLabel = skipLinkLabelProp ?? t('skip.main');
  const menuLabel = menuLabelProp ?? t('nav.openNavigation');
  const collapseLabel = collapseLabelProp ?? t('nav.collapseSidebar');
  const expandLabel = expandLabelProp ?? t('nav.expandSidebar');
  const sidebarId = useId();
  const [collapsed, setCollapsed] = usePersistedCollapse(collapsedProp, defaultCollapsed, storageKey, onCollapsedChange);
  const [drawerState, setDrawerState] = useState(false);
  const drawerOpen = drawerOpenProp ?? drawerState;
  const setDrawerOpen = (open: boolean) => {
    setDrawerState(open);
    onDrawerOpenChange?.(open);
  };
  const isCollapsed = collapsible && collapsed;
  const state = isCollapsed ? collapseMode : 'expanded';
  const s = sidebarLayoutVariants({ fullScreen, state });
  const desktop: SidebarSlotState = { collapsed: isCollapsed, inDrawer: false, closeDrawer: () => {} };
  const mobile: SidebarSlotState = { collapsed: false, inDrawer: true, closeDrawer: () => setDrawerOpen(false) };
  const ctx: SidebarLayoutContextValue = {
    collapsed: isCollapsed,
    setCollapsed,
    toggleCollapsed: () => setCollapsed(!collapsed),
    drawerOpen,
    setDrawerOpen,
  };
  const hidden = state === 'offcanvas';

  return (
    <SidebarLayoutContext.Provider value={ctx}>
      <div className={cn(s.root(), className)} data-sidebar-state={state}>
        <SkipLink targetId={mainId} className={s.skip()}>
          {skipLinkLabel}
        </SkipLink>
        <aside id={sidebarId} aria-label={sidebarLabel} data-state={state} inert={hidden || undefined} className={s.sidebar()}>
          {sidebarHeader && <div className={s.sidebarHeader()}>{renderSlot(sidebarHeader, desktop)}</div>}
          <div className={s.sidebarBody()}>{renderSlot(sidebar, desktop)}</div>
          {sidebarFooter && <div className={s.sidebarFooter()}>{renderSlot(sidebarFooter, desktop)}</div>}
        </aside>
        <div className={s.column()}>
          <header className={s.topbar()}>
            <Drawer side="left" open={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
              <DrawerTrigger render={<IconButton icon={MenuIcon} label={menuLabel} className={s.menuButton()} />} />
              <DrawerContent size="sm" className={s.drawer()} closeLabel={t('nav.closeNavigation')}>
                <DrawerHeader className={s.drawerHeader()}>
                  <DrawerTitle className={sidebarHeader ? 'sr-only' : undefined}>{sidebarLabel}</DrawerTitle>
                  {sidebarHeader && renderSlot(sidebarHeader, mobile)}
                </DrawerHeader>
                <DrawerBody className={s.drawerBody()}>
                  {renderSlot(sidebar, mobile)}
                  {sidebarFooter && renderSlot(sidebarFooter, mobile)}
                </DrawerBody>
              </DrawerContent>
            </Drawer>
            {collapsible && (
              <IconButton
                icon={isCollapsed ? PanelLeftOpen : PanelLeftClose}
                label={isCollapsed ? expandLabel : collapseLabel}
                aria-expanded={!isCollapsed}
                aria-controls={sidebarId}
                className={s.collapseButton()}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
            <div className={s.topbarContent()}>{topbar}</div>
          </header>
          <main id={mainId} tabIndex={-1} className={s.main()}>
            {children}
          </main>
        </div>
      </div>
    </SidebarLayoutContext.Provider>
  );
}
