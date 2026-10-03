import { Fragment, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { useI18n } from '../../i18n/I18nProvider';
import type { MessageKey } from '../../i18n/messages/en';
import { kbdVariants, type KbdVariantProps } from './kbd.variants';

/** Catalog keys for the spoken names of symbol keys (KEY_NAMES holds the English ones). */
const KEY_MESSAGES: Record<string, MessageKey> = {
  '⌘': 'kbd.command',
  '⌥': 'kbd.option',
  '⇧': 'kbd.shift',
  '⌃': 'kbd.control',
  '↵': 'kbd.enter',
  '⏎': 'kbd.enter',
  '⌫': 'kbd.backspace',
  '⇥': 'kbd.tab',
  '⎋': 'kbd.escape',
  '↑': 'kbd.up',
  '↓': 'kbd.down',
  '←': 'kbd.left',
  '→': 'kbd.right',
  '↑↓': 'kbd.upDown',
};

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'className'>, KbdVariantProps {
  className?: string;
  ref?: Ref<HTMLElement>;
  /** Spoken name for a symbol key. Defaults to a built-in name for ⌘ ⌥ ⇧ ⌃ ↵ ⌫ and arrows. */
  label?: string;
  children?: ReactNode;
}

/** One keyboard key. Symbol glyphs are hidden from screen readers and replaced by their name. */
export function Kbd({ size, label, className, children, ...props }: KbdProps) {
  const { t } = useI18n();
  const key = typeof children === 'string' ? KEY_MESSAGES[children] : undefined;
  const spoken = label ?? (key ? t(key) : undefined);
  return (
    <kbd className={cn(kbdVariants({ size }).key(), className)} {...props}>
      {spoken ? (
        <>
          <span aria-hidden>{children}</span>
          <span className="sr-only">{spoken}</span>
        </>
      ) : (
        children
      )}
    </kbd>
  );
}

export interface KbdComboProps extends Omit<HTMLAttributes<HTMLElement>, 'className'>, KbdVariantProps {
  className?: string;
  ref?: Ref<HTMLElement>;
  /** Keys pressed together, e.g. ['⌘', 'K']. */
  keys: string[];
  /** Visible joiner between keys (e.g. "+"); none by default, as on macOS. */
  separator?: ReactNode;
}

/** A key combination: nested <kbd> elements inside an outer <kbd>, per the HTML spec. */
export function KbdCombo({ keys, size, separator, className, ...props }: KbdComboProps) {
  const s = kbdVariants({ size });
  return (
    <kbd className={cn(s.combo(), className)} {...props}>
      {keys.map((k, i) => (
        <Fragment key={`${k}-${i}`}>
          {i > 0 && separator != null && <span aria-hidden className={s.plus()}>{separator}</span>}
          <Kbd size={size}>{k}</Kbd>
        </Fragment>
      ))}
    </kbd>
  );
}
