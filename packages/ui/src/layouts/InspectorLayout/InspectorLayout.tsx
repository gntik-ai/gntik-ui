import { PanelRight, Pin, X } from 'lucide-react';
import { createContext, useContext, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { IconButton, type IconButtonProps } from '../../components/Button';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from '../../components/Drawer';
import { inspectorLayoutVariants } from './inspector-layout.variants';
import { useI18n } from '../../i18n/I18nProvider';
import { useMediaQuery } from './use-media-query';

export interface InspectorLayoutContextValue {
  open: boolean;
  pinned: boolean;
  /** True on large screens (side panel); false when the panel is a bottom Drawer. */
  docked: boolean;
  panelId: string;
  setOpen: (open: boolean) => void;
  setPinned: (pinned: boolean) => void;
}

const InspectorContext = createContext<InspectorLayoutContextValue | null>(null);

/** Inspector state for anything rendered inside an InspectorLayout. */
export function useInspectorLayout(): InspectorLayoutContextValue {
  const ctx = useContext(InspectorContext);
  if (!ctx) throw new Error('useInspectorLayout must be used inside <InspectorLayout>.');
  return ctx;
}

export interface InspectorLayoutProps {
  className?: string;
  /** Main area (canvas, table, editor…). Place an InspectorToggle in it. */
  children?: ReactNode;
  /** Panel content (properties, details, comments…). */
  panel: ReactNode;
  /** Panel heading; also the accessible name of its landmark. */
  panelTitle: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pinned: the panel docks beside the main area. Unpinned: it overlays it and Escape closes it. */
  pinned?: boolean;
  defaultPinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  /** Panel width in px (large screens). */
  panelWidth?: number;
  pinLabel?: string;
  closeLabel?: string;
  /** Media query for the docked (side panel) mode; below it the panel is a bottom Drawer. */
  dockedQuery?: string;
  fullScreen?: boolean;
}

/**
 * Main area · pinnable right panel. Pinned, the panel docks beside the content; unpinned, it
 * overlays it and Escape closes it. Below lg the panel opens as a bottom Drawer.
 */
export function InspectorLayout({
  className,
  children,
  panel,
  panelTitle,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  pinned: pinnedProp,
  defaultPinned = true,
  onPinnedChange,
  panelWidth = 320,
  pinLabel: pinLabelProp,
  closeLabel: closeLabelProp,
  dockedQuery = '(min-width: 1024px)',
  fullScreen = false,
}: InspectorLayoutProps) {
  const { t } = useI18n();
  const pinLabel = pinLabelProp ?? t('inspector.pin');
  const closeLabel = closeLabelProp ?? t('inspector.close');
  const panelId = useId();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const docked = useMediaQuery(dockedQuery, true);
  const [openState, setOpenState] = useState(defaultOpen);
  const [pinnedState, setPinnedState] = useState(defaultPinned);
  const open = openProp ?? openState;
  const pinned = pinnedProp ?? pinnedState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const setPinned = (next: boolean) => {
    setPinnedState(next);
    onPinnedChange?.(next);
  };
  const focusToggle = () => rootRef.current?.querySelector<HTMLElement>('[data-inspector-toggle]')?.focus();
  const close = () => {
    setOpen(false);
    focusToggle();
  };

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || event.defaultPrevented || !open || pinned || !docked) return;
    const target = event.target as Node;
    const fromPanel = panelRef.current?.contains(target);
    const fromToggle = target instanceof HTMLElement && target.closest('[data-inspector-toggle]');
    if (!fromPanel && !fromToggle) return;
    event.preventDefault();
    close();
  }

  const s = inspectorLayoutVariants({ fullScreen, pinned });
  const ctx: InspectorLayoutContextValue = { open, pinned, docked, panelId, setOpen, setPinned };

  return (
    <InspectorContext.Provider value={ctx}>
      <div ref={rootRef} className={cn(s.root(), className)} onKeyDown={handleKeyDown} data-inspector-open={open || undefined}>
        <div className={s.main()}>{children}</div>
        {docked && open && (
          <aside
            ref={panelRef}
            id={panelId}
            aria-labelledby={titleId}
            tabIndex={-1}
            data-pinned={pinned || undefined}
            className={s.panel()}
            style={{ width: panelWidth, maxWidth: '100%' }}
          >
            <div className={s.panelHeader()}>
              <h2 id={titleId} className={s.panelTitle()}>
                {panelTitle}
              </h2>
              <IconButton size="sm" icon={Pin} label={pinLabel} aria-pressed={pinned} onClick={() => setPinned(!pinned)} />
              <IconButton size="sm" icon={X} label={closeLabel} onClick={close} />
            </div>
            <div className={s.panelBody()}>{panel}</div>
          </aside>
        )}
        {!docked && (
          <Drawer side="bottom" open={open} onOpenChange={(next) => setOpen(next)}>
            <DrawerContent size="md" closeLabel={closeLabel} id={panelId}>
              <DrawerHeader>
                <DrawerTitle>{panelTitle}</DrawerTitle>
              </DrawerHeader>
              <DrawerBody className={s.drawerBody()}>{panel}</DrawerBody>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </InspectorContext.Provider>
  );
}

export interface InspectorToggleProps extends Omit<IconButtonProps, 'icon' | 'label' | 'onClick'> {
  label?: string;
  icon?: IconButtonProps['icon'];
}

/** Opens / closes the inspector panel (aria-expanded, aria-controls). Place it in the main area. */
export function InspectorToggle({ label: labelProp, icon = PanelRight, className, ...props }: InspectorToggleProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('inspector.toggle');
  const { open, pinned, docked, panelId, setOpen } = useInspectorLayout();
  return (
    <IconButton
      icon={icon}
      label={label}
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      data-inspector-toggle=""
      className={className}
      onClick={() => {
        const next = !open;
        setOpen(next);
        // An overlaying panel takes focus so Escape and Tab work from inside it.
        if (next && docked && !pinned) requestAnimationFrame(() => document.getElementById(panelId)?.focus());
      }}
      {...props}
    />
  );
}
