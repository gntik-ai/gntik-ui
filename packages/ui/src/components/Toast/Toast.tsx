import { Toast as BaseToast } from '@base-ui/react/toast';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { usePortalContainer } from '../../utils/portal';
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

/** True while Base UI marks the enclosing toast root aria-hidden (e.g. high priority, viewport unfocused). */
const RootHiddenContext = createContext(false);

const isAriaHidden = (value: unknown) => value === true || value === 'true';

/**
 * Base UI marks some toast parts aria-hidden but leaves them tabbable (axe `aria-hidden-focus`).
 * Takes the part out of sequential focus while it is hidden, derived from Base UI's own computed
 * aria-hidden so the two cannot drift; `tabIndex -1` (not `inert`) keeps pointer use and `.focus()` working.
 */
function guardFocus<P extends HTMLAttributes<HTMLElement>>(props: P, hidden: boolean): P {
  return hidden ? { ...props, tabIndex: -1 } : props;
}

/** Close, Action and dismiss buttons: not tabbable while they, or their toast, are aria-hidden. */
function useControlGuard() {
  const rootHidden = useContext(RootHiddenContext);
  return <P extends HTMLAttributes<HTMLElement>>(props: P) =>
    guardFocus(props, rootHidden || isAriaHidden(props['aria-hidden']));
}

const FOCUSABLE =
  'a[href],button,input,select,textarea,summary,iframe,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
const SAVED_TABINDEX = 'data-gntik-toast-tabindex';

/** Takes (or gives back) sequential focus of whatever focusable content a title / description carries. */
function syncDescendantFocus(node: HTMLElement, hidden: boolean) {
  if (hidden) {
    node.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((el) => {
      const current = el.getAttribute('tabindex');
      if (current === '-1') return;
      // Content that re-asserts its own tabindex while hidden is guarded again; its value is what we give back.
      el.setAttribute(SAVED_TABINDEX, current ?? '');
      el.setAttribute('tabindex', '-1');
    });
  } else {
    node.querySelectorAll<HTMLElement>(`[${SAVED_TABINDEX}]`).forEach((el) => {
      const saved = el.getAttribute(SAVED_TABINDEX);
      if (saved) el.setAttribute('tabindex', saved);
      else el.removeAttribute('tabindex');
      el.removeAttribute(SAVED_TABINDEX);
    });
  }
}

/** Title / description text: links and other focusable content passed as ReactNode follow the hidden state of the root. */
function GuardedText({
  as: Tag,
  ref,
  ...rest
}: HTMLAttributes<HTMLElement> & { as: 'h2' | 'p'; ref?: Ref<HTMLElement> }) {
  const hidden = useContext(RootHiddenContext);
  const own = useRef<HTMLElement | null>(null);
  // Content can become focusable while hidden without this component rendering (a link gaining an
  // href, a child swapping in), so while hidden the subtree is also watched and re-guarded.
  useLayoutEffect(() => {
    const node = own.current;
    if (!node) return;
    syncDescendantFocus(node, hidden);
    if (!hidden) return;
    const observer = new MutationObserver(() => syncDescendantFocus(node, true));
    observer.observe(node, { subtree: true, childList: true, attributes: true });
    return () => observer.disconnect();
  });
  return (
    <Tag
      {...rest}
      ref={(node: HTMLElement | null) => {
        own.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
    />
  );
}

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

function GuardedAction({ className }: { className: string }) {
  const guard = useControlGuard();
  return <BaseToast.Action className={className} render={(props) => <button {...guard(props)} />} />;
}

function GuardedClose({ onClick, ...rest }: BaseToast.Close.Props) {
  const guard = useControlGuard();
  return <BaseToast.Close {...rest} onClick={onClick} render={(props) => <button {...guard(props)} />} />;
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
  /** Portal container; defaults to the nearest ThemeScope, otherwise document.body. */
  container?: BaseToast.Portal.Props['container'];
}

/**
 * The bottom-right stack (a `region` landmark named "Notifications"). F6 moves focus into it;
 * hovering or focusing it pauses auto-dismiss.
 */
export function Toaster({ className, closeLabel: closeLabelProp, container }: ToasterProps) {
  const portalContainer = usePortalContainer();
  const { t } = useI18n();
  const closeLabel = closeLabelProp ?? t('toast.dismiss');
  const dir = usePortalDir();
  const { toasts } = BaseToast.useToastManager<ToastData>();
  const s = toastVariants();
  return (
    <BaseToast.Portal container={container ?? portalContainer}>
      <BaseToast.Viewport dir={dir} className={cn(s.viewport(), className)}>
        {toasts.map((t) => {
          const type = t.type ? (TYPE_ALIASES[t.type] ?? t.type) : 'neutral';
          const tone = TONES.has(type) ? (type as ToastTone) : 'neutral';
          const dismiss = t.data?.dismissAction;
          const v = toastVariants({ tone });
          const IconCmp = TONE_ICON[tone];
          return (
            <BaseToast.Root
              key={t.id}
              toast={t}
              className={v.root()}
              render={(props) => {
                const hidden = isAriaHidden(props['aria-hidden']);
                return (
                  <RootHiddenContext.Provider value={hidden}>
                    <div {...guardFocus(props, hidden)} />
                  </RootHiddenContext.Provider>
                );
              }}
            >
              <BaseToast.Content className={v.content()}>
                {(IconCmp || tone === 'loading') && (
                  <span className={v.icon()}>
                    {IconCmp ? <IconCmp size={16} aria-hidden /> : <Spinner size={15} />}
                  </span>
                )}
                <div className={v.text()}>
                  <BaseToast.Title className={v.title()} render={(props) => <GuardedText as="h2" {...props} />} />
                  <BaseToast.Description
                    className={v.description()}
                    render={(props) => <GuardedText as="p" {...props} />}
                  />
                  {(t.actionProps || dismiss) && (
                    <div className={v.actions()}>
                      {t.actionProps && <GuardedAction className={v.action()} />}
                      {dismiss && (
                        <GuardedClose className={v.dismissAction()} onClick={() => dismiss.onClick?.()}>
                          {dismiss.label}
                        </GuardedClose>
                      )}
                    </div>
                  )}
                </div>
                <GuardedClose aria-label={closeLabel} className={v.close()}>
                  <X size={13} strokeWidth={2.4} aria-hidden />
                </GuardedClose>
              </BaseToast.Content>
            </BaseToast.Root>
          );
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}
