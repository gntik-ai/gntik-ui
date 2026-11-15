import { CalendarDays } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { PopoverTrigger } from '../Popover';

/** Kept separate so the default read-only trigger retains its DOM. */
export function EditableDateTrigger({
  children,
  buttonRef,
  disabled,
  readOnly,
  className,
}: {
  children: ReactNode;
  buttonRef: RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div
      className={cn('flex min-w-0 items-center gap-2', className)}
      onKeyDownCapture={(event) => {
        if (event.altKey && event.key === 'ArrowDown' && !disabled && !readOnly) {
          event.preventDefault();
          event.stopPropagation();
          // Moving focus flushes the edited segment before the popup is opened.
          buttonRef.current?.focus();
          if (buttonRef.current?.getAttribute('aria-expanded') !== 'true') buttonRef.current?.click();
        }
      }}
    >
      {children}
      <PopoverTrigger
        ref={buttonRef}
        disabled={disabled || readOnly}
        aria-label={t('datePicker.choose')}
        aria-haspopup="dialog"
        render={<Button variant="secondary" iconOnly />}
      >
        <CalendarDays size={16} aria-hidden />
      </PopoverTrigger>
    </div>
  );
}

/** Segment edits are interactions with the composite trigger, not outside dismissal. */
export function keepEditableOpen(
  details: { reason: string; event: Event; cancel: () => void },
  button: HTMLButtonElement | null,
): boolean {
  if (details.reason !== 'outside-press' && details.reason !== 'focus-out') return false;
  const target = details.event instanceof FocusEvent ? details.event.relatedTarget : details.event.target;
  if (target instanceof Node && button?.parentElement?.contains(target)) {
    details.cancel();
    return true;
  }
  return false;
}
