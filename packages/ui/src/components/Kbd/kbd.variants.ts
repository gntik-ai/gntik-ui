import { tv, type VariantProps } from '../../utils/tv';

export const kbdVariants = tv({
  slots: {
    key: 'inline-flex items-center justify-center rounded border border-border bg-card font-mono font-semibold leading-none text-muted-foreground',
    combo: 'inline-flex items-center gap-1 font-mono',
    plus: 'text-[10px] text-muted-foreground',
  },
  variants: {
    size: {
      sm: { key: 'h-4 min-w-4 px-1 text-[10px]' },
      md: { key: 'h-5 min-w-5 px-1.5 text-[10px]' },
      lg: { key: 'h-6 min-w-6 px-1.5 text-[11.5px]' },
    },
  },
  defaultVariants: { size: 'md' },
});

export type KbdVariantProps = VariantProps<typeof kbdVariants>;

/** Spoken names for symbol keys, read by screen readers instead of the glyph. */
export const KEY_NAMES: Record<string, string> = {
  '⌘': 'Command',
  '⌥': 'Option',
  '⇧': 'Shift',
  '⌃': 'Control',
  '↵': 'Enter',
  '⏎': 'Enter',
  '⌫': 'Backspace',
  '⇥': 'Tab',
  '⎋': 'Escape',
  '↑': 'Up arrow',
  '↓': 'Down arrow',
  '←': 'Left arrow',
  '→': 'Right arrow',
  '↑↓': 'Up and down arrows',
};
