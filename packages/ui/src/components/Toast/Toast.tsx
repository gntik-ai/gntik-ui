import { Toast as BaseToast } from '@base-ui/react/toast';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { toastVariants, type ToastTone } from './toast.variants';

const TONE_ICON: Record<ToastTone, LucideIcon | null> = {
  neutral: null,
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  destructive: CircleAlert,
};
const TONES = new Set<string>(Object.keys(TONE_ICON));
let toastSeq = 0;

export interface ToastProviderProps extends BaseToast.Provider.Props {
  /** Default auto-dismiss time in ms; 0 keeps toasts until closed. */
  timeout?: number;
  /** Maximum visible toasts; older ones are hidden until the newer close. */
  limit?: number;
}

/** Holds the toast queue. Wrap the app once and render a `<Toaster />` inside it. */
export function ToastProvider({ timeout = 5000, limit = 4, ...props }: ToastProviderProps) {
  return <BaseToast.Provider timeout={timeout} limit={limit} {...props} />;
}

export interface ToastOptions {
  /** Pass an existing id to update that toast in place. */
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss time in ms; 0 keeps it until closed. Defaults to the provider's timeout. */
  timeout?: number;
  /** `high` announces urgently (assertive). Use for errors that need attention. */
  priority?: 'low' | 'high';
  /** One inline action, e.g. Undo. Clicking it runs `onClick` and closes the toast. */
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}

/** Queue toasts from any component under ToastProvider: `const toast = useToast(); toast.add({ … })`. */
export function useToast() {
  const manager = BaseToast.useToastManager();
  const { add: baseAdd, close, update, promise, toasts } = manager;
  return useMemo(
    () => ({
      toasts,
      close,
      update,
      promise,
      /** Shows a toast and returns its id. */
      add: ({ tone = 'neutral', action, id, ...options }: ToastOptions) => {
        const toastId = id ?? `gntik-toast-${++toastSeq}`;
        return baseAdd({
          ...options,
          id: toastId,
          type: tone,
          actionProps: action
            ? {
                children: action.label,
                onClick: () => {
                  action.onClick();
                  close(toastId);
                },
              }
            : undefined,
        });
      },
    }),
    [toasts, baseAdd, close, update, promise],
  );
}

export interface ToasterProps {
  className?: string;
  /** Accessible name of each toast's close button. */
  closeLabel?: string;
  /** Portal container; defaults to document.body. */
  container?: BaseToast.Portal.Props['container'];
}

/**
 * The bottom-right stack (a `region` landmark named "Notifications"). F6 moves focus into it;
 * hovering or focusing it pauses auto-dismiss.
 */
export function Toaster({ className, closeLabel: closeLabelProp, container }: ToasterProps) {
  const { t } = useI18n();
  const closeLabel = closeLabelProp ?? t('toast.dismiss');
  const dir = usePortalDir();
  const { toasts } = BaseToast.useToastManager();
  const s = toastVariants();
  return (
    <BaseToast.Portal container={container}>
      <BaseToast.Viewport dir={dir} className={cn(s.viewport(), className)}>
        {toasts.map((t) => {
          const tone = t.type && TONES.has(t.type) ? (t.type as ToastTone) : 'neutral';
          const v = toastVariants({ tone });
          const IconCmp = TONE_ICON[tone];
          return (
            <BaseToast.Root key={t.id} toast={t} className={v.root()}>
              <BaseToast.Content className={v.content()}>
                {IconCmp && (
                  <span className={v.icon()}>
                    <IconCmp size={16} aria-hidden />
                  </span>
                )}
                <div className={v.text()}>
                  <BaseToast.Title className={v.title()} />
                  <BaseToast.Description className={v.description()} />
                  {t.actionProps && (
                    <div>
                      <BaseToast.Action className={v.action()} />
                    </div>
                  )}
                </div>
                <BaseToast.Close aria-label={closeLabel} className={v.close()}>
                  <X size={13} strokeWidth={2.4} aria-hidden />
                </BaseToast.Close>
              </BaseToast.Content>
            </BaseToast.Root>
          );
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}
