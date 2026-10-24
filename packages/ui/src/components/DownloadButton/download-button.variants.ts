import { tv, type VariantProps } from '../../utils/tv';

/** Button owns visual states; this slot hides the fallback announcement visually. */
export const downloadButtonVariants = tv({
  slots: { button: '', status: 'sr-only' },
});

export type DownloadButtonVariantProps = VariantProps<typeof downloadButtonVariants>;
