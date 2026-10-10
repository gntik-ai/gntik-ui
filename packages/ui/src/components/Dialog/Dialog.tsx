import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { dialogVariants, type DialogVariantProps } from './dialog.variants';

const s = dialogVariants();

/** Dialog state container (open, defaultOpen, onOpenChange, modal). Renders no element. */
export const Dialog = BaseDialog.Root;
/** Opens the dialog. Use `render={<Button />}` to style it as a kit button. */
export const DialogTrigger = BaseDialog.Trigger;
/** Closes the dialog. Use `render={<Button variant="ghost" />}` for footer actions. */
export const DialogClose = BaseDialog.Close;

export interface DialogContentProps extends Omit<BaseDialog.Popup.Props, 'className'>, DialogVariantProps {
  className?: string;
  /** Show the top-right close button. */
  showClose?: boolean;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** Portal container; defaults to document.body. */
  container?: BaseDialog.Portal.Props['container'];
  children?: ReactNode;
}

/**
 * The modal surface: portal, backdrop, scrollable viewport and popup. Focus is trapped
 * inside, Escape and an outside press close it, and focus returns to the trigger.
 */
export function DialogContent({ size, presentation, className, showClose = true, closeLabel: closeLabelProp, container, children, ...props }: DialogContentProps) {
  const { t } = useI18n();
  const closeLabel = closeLabelProp ?? t('common.close');
  const dir = usePortalDir();
  const v = dialogVariants({ size, presentation });
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Backdrop className={v.backdrop()} />
      <BaseDialog.Viewport dir={dir} className={v.viewport()}>
        <BaseDialog.Popup className={cn(v.popup(), className)} {...props}>
          {children}
          {showClose && (
            <BaseDialog.Close aria-label={closeLabel} className={v.close()}>
              <X size={16} aria-hidden />
            </BaseDialog.Close>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.header(), className)} {...props} />;
}

export function DialogTitle({ className, ...props }: Omit<BaseDialog.Title.Props, 'className'> & { className?: string }) {
  return <BaseDialog.Title className={cn(s.title(), className)} {...props} />;
}

export function DialogDescription({ className, ...props }: Omit<BaseDialog.Description.Props, 'className'> & { className?: string }) {
  return <BaseDialog.Description className={cn(s.description(), className)} {...props} />;
}

export function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.body(), className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.footer(), className)} {...props} />;
}
