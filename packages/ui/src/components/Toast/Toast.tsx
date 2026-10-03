import { Toast as BaseToast } from '@base-ui/react/toast';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Spinner } from '../Spinner';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { toastVariants, type ToastTone } from './toast.variants';

const TONE_ICON: Record<ToastTone, LucideIcon | null> = {
  neutral: null,
  loading: null,
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  destructive: CircleAlert,
};
const TONES = new Set<string>(Object.keys(TONE_ICON));
/** Base UI's own promise types, mapped onto the kit tones. */
const TYPE_ALIASES: Record<string, ToastTone> = { error: 'destructive' };
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
  /** Primary inline action, e.g. Undo. Clicking it runs `onClick` and closes the toast. */
  action?: { label: string; onClick: () => void };
  /**
   * Secondary text button that closes the toast, e.g. "Not now". Runs `onClick` (if any) first.
   * Like `action`, it is reachable with F6 → Tab; auto-dismiss pauses while the stack is focused or hovered.
   */
  dismissAction?: { label: string; onClick?: () => void };
  onClose?: () => void;
}

/** One state of a promise toast: a title string, full options, or a function of the result / error. */
export type ToastPromiseState<Arg> = string | ToastOptions | ((arg: Arg) => string | ToastOptions);

export interface ToastPromiseOptions<Value> {
  /** Shown while pending (tone `loading`, never auto-dismissed). */
  loading: string | ToastOptions;
  /** Replaces the loading toast in place on success (tone `success` unless given). */
  success: ToastPromiseState<Value>;
  /** Replaces the loading toast in place on failure (tone `destructive`, announced assertively, unless given). */
  error: ToastPromiseState<unknown>;
}

interface ToastData {
  dismissAction?: ToastOptions['dismissAction'];
}

function resolveState<Arg>(state: ToastPromiseState<Arg>, arg: Arg): ToastOptions {
  const value = typeof state === 'function' ? state(arg) : state;
  return typeof value === 'string' ? { title: value } : value;
}

/** Queue toasts from any component under ToastProvider: `const toast = useToast(); toast.add({ … })`. */
export function useToast() {
  const manager = BaseToast.useToastManager<ToastData>();
  const { add: baseAdd, close, update, toasts } = manager;
  return useMemo(() => {
    const toBase = (toastId: string, { tone = 'neutral', action, dismissAction, ...options }: ToastOptions) => {
      const base = {
        ...options,
        type: tone,
        data: { dismissAction },
        actionProps: action
          ? {
              children: action.label,
              onClick: () => {
                action.onClick();
                close(toastId);
              },
            }
          : undefined,
      };
      delete base.id; // the id is passed separately (and must never reach update())
      return base;
    };
    /** Shows a toast and returns its id. */
    const add = (options: ToastOptions) => {
      const toastId = options.id ?? `gntik-toast-${++toastSeq}`;
      return baseAdd({ ...toBase(toastId, options), id: toastId });
    };
    /**
     * One toast that follows a promise: `loading` while pending, then updated in place to
     * `success` or `error` (which also restart its auto-dismiss). Returns the promise's own result,
     * so a rejection still rejects: `toast.promise(save(), {…}).catch(() => {})`.
     */
    const promise = <Value,>(task: Promise<Value>, options: ToastPromiseOptions<Value>): Promise<Value> => {
      const id = add({ ...resolveState(options.loading, undefined), tone: 'loading', timeout: 0 });
      return task.then(
        (value) => {
          const next = resolveState(options.success, value);
          update(id, { ...toBase(id, { tone: 'success', ...next }), timeout: next.timeout });
          return value;
        },
        (error: unknown) => {
          const next = resolveState(options.error, error);
          update(id, { ...toBase(id, { tone: 'destructive', priority: 'high', ...next }), timeout: next.timeout });
          throw error;
        },
      );
    };
    return { toasts, close, update, promise, add };
  }, [toasts, baseAdd, close, update]);
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
  const { toasts } = BaseToast.useToastManager<ToastData>();
  const s = toastVariants();
  return (
    <BaseToast.Portal container={container}>
      <BaseToast.Viewport dir={dir} className={cn(s.viewport(), className)}>
        {toasts.map((t) => {
          const type = t.type ? (TYPE_ALIASES[t.type] ?? t.type) : 'neutral';
          const tone = TONES.has(type) ? (type as ToastTone) : 'neutral';
          const dismiss = t.data?.dismissAction;
          const v = toastVariants({ tone });
          const IconCmp = TONE_ICON[tone];
          return (
            <BaseToast.Root key={t.id} toast={t} className={v.root()}>
              <BaseToast.Content className={v.content()}>
                {(IconCmp || tone === 'loading') && (
                  <span className={v.icon()}>{IconCmp ? <IconCmp size={16} aria-hidden /> : <Spinner size={15} />}</span>
                )}
                <div className={v.text()}>
                  <BaseToast.Title className={v.title()} />
                  <BaseToast.Description className={v.description()} />
                  {(t.actionProps || dismiss) && (
                    <div className={v.actions()}>
                      {t.actionProps && <BaseToast.Action className={v.action()} />}
                      {dismiss && (
                        <BaseToast.Close className={v.dismissAction()} onClick={() => dismiss.onClick?.()}>
                          {dismiss.label}
                        </BaseToast.Close>
                      )}
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
