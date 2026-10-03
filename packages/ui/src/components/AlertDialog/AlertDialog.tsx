import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { Info, TriangleAlert } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Button, type ButtonProps } from '../Button';
import { dialogVariants, type DialogVariantProps } from '../Dialog/dialog.variants';
import { alertDialogVariants, type AlertDialogVariantProps } from './alertDialog.variants';

type Tone = NonNullable<AlertDialogVariantProps['tone']>;
type IconComponent = NonNullable<ButtonProps['icon']>;

const s = alertDialogVariants();
const TONE_ICON: Record<Tone, IconComponent> = { destructive: TriangleAlert, warning: TriangleAlert, info: Info };

/** Alert dialog state container (open, defaultOpen, onOpenChange). Renders no element. */
export const AlertDialog = BaseAlertDialog.Root;
/** Opens the alert dialog. Use `render={<Button />}` to style it as a kit button. */
export const AlertDialogTrigger = BaseAlertDialog.Trigger;

export interface AlertDialogContentProps extends Omit<BaseAlertDialog.Popup.Props, 'className'> {
  className?: string;
  /** Popup width; confirmations default to `sm`. */
  size?: DialogVariantProps['size'];
  /** Portal container; defaults to document.body. */
  container?: BaseAlertDialog.Portal.Props['container'];
  children?: ReactNode;
}

/**
 * The confirmation surface (role `alertdialog`). Focus is trapped inside, Escape closes it and
 * focus returns to the trigger. Unlike Dialog, an outside press does not dismiss it.
 */
export function AlertDialogContent({ size = 'sm', className, container, children, ...props }: AlertDialogContentProps) {
  const v = dialogVariants({ size });
  return (
    <BaseAlertDialog.Portal container={container}>
      <BaseAlertDialog.Backdrop className={v.backdrop()} />
      <BaseAlertDialog.Viewport className={v.viewport()}>
        <BaseAlertDialog.Popup className={cn(v.popup(), s.popup(), className)} {...props}>
          {children}
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  );
}

export interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Colour of the icon tile. */
  tone?: Tone;
  /** Overrides the tone's default icon (a lucide icon component). Pass `null` to hide it. */
  icon?: IconComponent | null;
}

/** Icon tile + text column holding AlertDialogTitle and AlertDialogDescription. */
export function AlertDialogHeader({ tone = 'destructive', icon, className, children, ...props }: AlertDialogHeaderProps) {
  const IconCmp = icon === undefined ? TONE_ICON[tone] : icon;
  return (
    <div className={cn(s.header(), className)} {...props}>
      {IconCmp && (
        <span className={alertDialogVariants({ tone }).icon()}>
          <IconCmp size={20} aria-hidden />
        </span>
      )}
      <div className={s.text()}>{children}</div>
    </div>
  );
}

export function AlertDialogTitle({ className, ...props }: Omit<BaseAlertDialog.Title.Props, 'className'> & { className?: string }) {
  return <BaseAlertDialog.Title className={cn(s.title(), className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }: Omit<BaseAlertDialog.Description.Props, 'className'> & { className?: string }) {
  return <BaseAlertDialog.Description className={cn(s.description(), className)} {...props} />;
}

/** Right-aligned action row: Cancel first, the confirming action last. */
export function AlertDialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.footer(), className)} {...props} />;
}

export interface AlertDialogActionProps extends Omit<BaseAlertDialog.Close.Props, 'className' | 'render'> {
  className?: string;
  /** Button style; confirmations of irreversible actions use `destructive`. */
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  /** Leading icon (a lucide icon component). */
  icon?: ButtonProps['icon'];
}

/** The confirming action: runs `onClick`, then closes the dialog. */
export function AlertDialogAction({ variant = 'destructive', size, icon, className, ...props }: AlertDialogActionProps) {
  return <BaseAlertDialog.Close render={<Button variant={variant} size={size} icon={icon} className={className} />} {...props} />;
}

/** The neutral way out. Closes the dialog without side effects. */
export function AlertDialogCancel({ variant = 'ghost', size, icon, className, ...props }: AlertDialogActionProps) {
  return <BaseAlertDialog.Close render={<Button variant={variant} size={size} icon={icon} className={className} />} {...props} />;
}
