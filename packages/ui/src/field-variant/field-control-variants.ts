/** Only alternate chrome overrides the existing outline classes. Forced colours retain a boundary. */
export const fieldControlVariants = {
  outline: '',
  filled: 'border-transparent bg-secondary shadow-none forced-colors:border-[ButtonText]',
  ghost: 'border-transparent bg-transparent shadow-none hover:bg-secondary/50 forced-colors:border-[ButtonText]',
} as const;

/** Picker hover must not mask a keyboard-focus, open-popup or error border. */
export const fieldPickerHover =
  'hover:border-transparent hover:focus-visible:border-primary/60 hover:data-popup-open:border-primary/60 hover:data-invalid:border-destructive/70 hover:aria-invalid:border-destructive/70';
