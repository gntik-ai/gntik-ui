import { tv, type VariantProps } from '../../utils/tv';

export const qrCodeVariants = tv({
  slots: {
    root: 'relative inline-block shrink-0 overflow-hidden rounded-md bg-qr-surface text-qr-module align-middle',
    svg: 'block size-full fill-qr-module',
    overlay:
      'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-qr-surface p-2 text-center text-[13px] leading-snug text-qr-module',
    placeholder:
      'flex size-full items-center justify-center rounded-md border border-dashed border-border bg-card p-3 text-center text-[13px] leading-snug text-muted-foreground',
  },
});

export type QrCodeVariantProps = VariantProps<typeof qrCodeVariants>;
