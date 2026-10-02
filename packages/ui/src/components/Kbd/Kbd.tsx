import { Fragment, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { KEY_NAMES, kbdVariants, type KbdVariantProps } from './kbd.variants';

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'className'>, KbdVariantProps {
  className?: string;
  ref?: Ref<HTMLElement>;
  /** Spoken name for a symbol key. Defaults to a built-in name for ⌘ ⌥ ⇧ ⌃ ↵ ⌫ and arrows. */
  label?: string;
  children?: ReactNode;
}

/** One keyboard key. Symbol glyphs are hidden from screen readers and replaced by their name. */
export function Kbd({ size, label, className, children, ...props }: KbdProps) {
  const spoken = label ?? (typeof children === 'string' ? KEY_NAMES[children] : undefined);
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
