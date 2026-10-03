import { Menu as MenuIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from '../Button';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, type DrawerSide } from '../Drawer';
import { NavList, type NavGroup, type NavItem } from '../NavList';
import { useI18n } from '../../i18n/I18nProvider';
import { mobileNavVariants } from './mobile-nav.variants';

export interface MobileNavProps {
  /** Classes for the trigger, e.g. `lg:hidden` to show it only on small screens. */
  className?: string;
  /** Classes for the sheet panel. */
  contentClassName?: string;
  groups: NavGroup[];
  currentHref?: string;
  /** Sheet heading (brand or workspace name). Also the dialog's accessible name. */
  title?: ReactNode;
  /** Accessible name of the sheet when `title` is not plain text, and of the nav landmark. */
  label?: string;
  /** Accessible name of the menu button. */
  triggerLabel?: string;
  /** Content under the navigation (e.g. a WorkspaceSwitcher or UserMenu). */
  footer?: ReactNode;
  side?: Extract<DrawerSide, 'left' | 'right'>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called when an item is activated; the sheet then closes. */
  onNavigate?: (item: NavItem) => void;
}

/**
 * Small-screen navigation: a menu icon button that opens a Drawer holding a NavList. The sheet
 * closes when an item is activated, on Escape, on an outside press or on swipe.
 */
export function MobileNav({
  className,
  contentClassName,
  groups,
  currentHref,
  title,
  label: labelProp,
  triggerLabel: triggerLabelProp,
  footer,
  side = 'left',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onNavigate,
}: MobileNavProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('nav.navigation');
  const triggerLabel = triggerLabelProp ?? t('nav.openNavigation');
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const s = mobileNavVariants();
  return (
    <Drawer side={side} open={open} onOpenChange={(next) => setOpen(next)}>
      <DrawerTrigger render={<IconButton icon={MenuIcon} label={triggerLabel} className={className} />} />
      <DrawerContent size="sm" className={cn(s.popup(), contentClassName)} closeLabel={t('nav.closeNavigation')}>
        <DrawerHeader className={s.header()}>
          <DrawerTitle className={s.title()}>{title ?? label}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className={s.body()}>
          <NavList
            groups={groups}
            currentHref={currentHref}
            label={label}
            onNavigate={(item) => {
              onNavigate?.(item);
              setOpen(false);
            }}
          />
        </DrawerBody>
        {footer && <DrawerFooter className={s.footer()}>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
