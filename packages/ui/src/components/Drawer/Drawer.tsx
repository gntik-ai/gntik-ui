import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { X } from 'lucide-react';
import { createContext, useContext, type HTMLAttributes, type ReactNode } from 'react';
import { useI18n, usePortalDir } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { drawerVariants, type DrawerVariantProps } from './drawer.variants';

export type DrawerSide = NonNullable<DrawerVariantProps['side']>;

const s = drawerVariants();
type Swipe = BaseDrawer.Root.Props['swipeDirection'];
// `left` / `right` are the inline start / end edges: in RTL they mirror (and so does the swipe).
const SWIPE: Record<'ltr' | 'rtl', Record<DrawerSide, Swipe>> = {
  ltr: { right: 'right', left: 'left', bottom: 'down' },
  rtl: { right: 'left', left: 'right', bottom: 'down' },
};
const SideContext = createContext<DrawerSide>('right');

export interface DrawerProps extends Omit<BaseDrawer.Root.Props, 'swipeDirection'> {
  /**
   * Edge the panel slides in from; it is also the swipe-to-dismiss direction. `right` and `left`
   * are the inline end and start edges, so they mirror under RTL (I18nProvider `dir`).
   */
  side?: DrawerSide;
}

/** Drawer state container (open, defaultOpen, onOpenChange, modal). Renders no element. */
export function Drawer({ side = 'right', ...props }: DrawerProps) {
  const { dir } = useI18n();
  return (
    <SideContext.Provider value={side}>
      <BaseDrawer.Root swipeDirection={SWIPE[dir][side]} {...props} />
    </SideContext.Provider>
  );
}

/** Opens the drawer. Use `render={<Button />}` to style it as a kit button. */
export const DrawerTrigger = BaseDrawer.Trigger;
/** Closes the drawer. Use `render={<Button variant="ghost" />}` for footer actions. */
export const DrawerClose = BaseDrawer.Close;

export interface DrawerContentProps extends Omit<BaseDrawer.Popup.Props, 'className'> {
  className?: string;
  /** Panel width (left/right) or max height (bottom). */
  size?: DrawerVariantProps['size'];
  /** Show the top-right close button. */
  showClose?: boolean;
  /** Accessible name of the close button (default: the catalog's "Close"). */
  closeLabel?: string;
  /** Portal container; defaults to document.body. */
  container?: BaseDrawer.Portal.Props['container'];
  children?: ReactNode;
}

/**
 * The panel: portal, backdrop, viewport and popup sliding in from the Drawer's `side`.
 * Focus is trapped inside, Escape, an outside press or a swipe close it, and focus returns
 * to the trigger. Lay out the inside with DrawerHeader, DrawerBody and DrawerFooter.
 */
export function DrawerContent({ size, className, showClose = true, closeLabel, container, children, ...props }: DrawerContentProps) {
  const dir = usePortalDir();
  const { t } = useI18n();
  const side = useContext(SideContext);
  const v = drawerVariants({ side, size });
  return (
    <BaseDrawer.Portal container={container}>
      <BaseDrawer.Backdrop className={v.backdrop()} />
      <BaseDrawer.Viewport dir={dir} className={v.viewport()}>
        <BaseDrawer.Popup className={cn(v.popup(), className)} {...props}>
          {side === 'bottom' && <div className={v.handle()} aria-hidden />}
          <BaseDrawer.Content className={v.content()}>{children}</BaseDrawer.Content>
          {showClose && (
            <BaseDrawer.Close aria-label={closeLabel ?? t('common.close')} className={v.close()}>
              <X size={16} aria-hidden />
            </BaseDrawer.Close>
          )}
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}

/** Fixed top bar: title, description and any leading media. */
export function DrawerHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.header(), className)} {...props} />;
}

export function DrawerTitle({ className, ...props }: Omit<BaseDrawer.Title.Props, 'className'> & { className?: string }) {
  return <BaseDrawer.Title className={cn(s.title(), className)} {...props} />;
}

export function DrawerDescription({ className, ...props }: Omit<BaseDrawer.Description.Props, 'className'> & { className?: string }) {
  return <BaseDrawer.Description className={cn(s.description(), className)} {...props} />;
}

/** Scrollable middle section. */
export function DrawerBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.body(), className)} {...props} />;
}

/** Fixed bottom bar for actions. */
export function DrawerFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.footer(), className)} {...props} />;
}
