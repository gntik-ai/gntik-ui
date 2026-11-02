import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { createPortal } from 'react-dom';
import { createContext, useContext, type HTMLAttributes } from 'react';
import { useI18n } from '../../i18n';
import { Button, type ButtonProps } from '../Button/Button';
import { cn } from '../../utils/cn';
import { usePortalContainer } from '../../utils/portal';
import { useDropzone, type UseDropzoneOptions, type DragState } from './useDropzone';
import { dropzoneVariants } from './dropzone.variants';

export interface DropzoneProps
  extends Omit<useRender.ComponentProps<'div'>, 'className' | 'onDrop'>, UseDropzoneOptions {
  className?: string;
}
const Context = createContext<{
  dragState: DragState;
  open: () => void;
  disabled?: boolean;
  activateOnClick?: boolean;
  accept?: UseDropzoneOptions['accept'];
  maxSize?: number;
} | null>(null);
function useZone() {
  const zone = useContext(Context);
  if (!zone) throw new Error('Dropzone parts require Dropzone');
  return zone;
}

export function Dropzone({
  accept,
  maxSize,
  maxFiles,
  multiple,
  fullScreen,
  disabled,
  activateOnClick = true,
  onDrop,
  onReject,
  render,
  ref,
  className,
  children,
  ...props
}: DropzoneProps) {
  const { t } = useI18n();
  const portalContainer = usePortalContainer();
  const zone = useDropzone({
    accept,
    maxSize,
    maxFiles,
    multiple,
    fullScreen,
    disabled,
    activateOnClick,
    onDrop,
    onReject,
  });
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(zone.rootProps, props, {
      className: cn(
        dropzoneVariants({ dragState: zone.dragState, disabled }),
        fullScreen && 'fixed inset-0 z-overlay grid content-center bg-background',
        className,
      ),
      children: children ?? (zone.dragState === 'reject' ? t('dropzone.reject') : t('dropzone.label')),
    }),
  });
  return (
    <Context.Provider value={{ ...zone, disabled, activateOnClick, accept, maxSize }}>
      {fullScreen ? zone.dragState !== 'idle' && createPortal(element, portalContainer ?? document.body) : element}
      <input {...zone.inputProps} />
      <span role="status" aria-live="polite" className="sr-only">
        {zone.announcement}
      </span>
    </Context.Provider>
  );
}
export function DropzoneAccept(props: HTMLAttributes<HTMLDivElement>) {
  return useZone().dragState === 'accept' ? <div {...props} /> : null;
}
export function DropzoneReject(props: HTMLAttributes<HTMLDivElement>) {
  return useZone().dragState === 'reject' ? <div {...props} /> : null;
}
export function DropzoneIdle(props: HTMLAttributes<HTMLDivElement>) {
  return useZone().dragState === 'idle' ? <div {...props} /> : null;
}

export function DropzoneTrigger({ disabled, onClick, children, ...props }: ButtonProps) {
  const zone = useZone();
  const { t } = useI18n();
  if (zone.activateOnClick) return null;
  return (
    <Button
      {...props}
      disabled={disabled || zone.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) zone.open();
      }}
    >
      {children ?? t('upload.browse')}
    </Button>
  );
}
export function DropzoneCaption({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { accept, maxSize } = useZone();
  const { t, formatBytes } = useI18n();
  const types =
    (typeof accept === 'string' ? accept : accept?.join(','))
      ?.split(',')
      .map((rule) => rule.trim().replace(/^\./, '').toUpperCase())
      .join(' · ') || t('upload.files');
  return (
    <p {...props} className={cn('mt-3 text-sm text-muted-foreground', className)}>
      {maxSize === undefined ? types : t('upload.hint', { types, size: formatBytes(maxSize) })}
    </p>
  );
}
