import { X } from 'lucide-react';
import { useCallback, useSyncExternalStore, type MouseEvent } from 'react';
import { useI18n } from '../i18n';
import { cn } from './cn';

export interface ClearableProps {
  /** Show a clear button while the editable control has a value. */
  clearable?: boolean;
  /** Called after the value change when the control is cleared. */
  onClear?: () => void;
  /** Override the localized clear button name. */
  clearLabel?: string;
}

/** Resolve the control's name without including its selected value or adjacent buttons. */
function controlLabel(control: HTMLElement | null) {
  if (!control) return '';
  const labelledBy = control.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => control.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim();
    if (text) return text;
  }
  const ariaLabel = control.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;
  if ('labels' in control) {
    return Array.from((control as HTMLInputElement).labels ?? [])
      .map((label) => label.textContent ?? '')
      .join(' ')
      .trim();
  }
  return '';
}

export function ClearControlButton({
  control,
  clearLabel,
  onClick,
  className,
  allowReadOnly = false,
}: {
  control: HTMLElement | null;
  clearLabel?: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  allowReadOnly?: boolean;
}) {
  const { t } = useI18n();
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!control) return () => {};
      const observer = new MutationObserver(notify);
      observer.observe(control.ownerDocument.body, {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true,
      });
      return () => observer.disconnect();
    },
    [control],
  );
  const label = useSyncExternalStore(
    subscribe,
    () => controlLabel(control),
    () => '',
  );
  const blocked = useSyncExternalStore(
    subscribe,
    () =>
      !!control &&
      (control.matches(':disabled, [aria-disabled="true"], [data-disabled]') ||
        (!allowReadOnly && control.matches('[readonly], [aria-readonly="true"]'))),
    () => false,
  );
  if (blocked) return null;
  return (
    <button
      type="button"
      aria-label={clearLabel ?? (label ? t('common.clearItem', { label }) : t('common.clear'))}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground focus-ring',
        className,
      )}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      <X size={14} aria-hidden />
    </button>
  );
}

/** Use the prototype setter so React and Base UI receive a real bubbling edit. */
export function resetNativeValue(control: HTMLInputElement | HTMLTextAreaElement) {
  const view = control.ownerDocument.defaultView;
  if (!view) return;
  const prototype =
    control.tagName === 'TEXTAREA' ? view.HTMLTextAreaElement.prototype : view.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(control, '');
  control.dispatchEvent(new view.Event('input', { bubbles: true }));
}

/** Compatible with Base UI change details for an imperative reset. */
export function clearChangeDetails(event: Event, trigger: Element | undefined) {
  const details = {
    reason: 'none' as const,
    event,
    trigger,
    isCanceled: false,
    isPropagationAllowed: false,
    cancel() {
      details.isCanceled = true;
    },
    allowPropagation() {
      details.isPropagationAllowed = true;
    },
  };
  return details;
}
