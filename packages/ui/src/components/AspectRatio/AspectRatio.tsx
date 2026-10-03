import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../../utils/cn';
import { aspectRatioVariants, type AspectRatioVariantProps } from './aspect-ratio.variants';

export interface AspectRatioProps extends Omit<useRender.ComponentProps<'div'>, 'className'> {
  className?: string;
  /** Width / height, e.g. `16 / 9` (default), `4 / 3`, `1`. */
  ratio?: number;
  /** Corner radius: none, md, lg (default) or xl. */
  radius?: AspectRatioVariantProps['radius'];
  /** Paints a bordered secondary placeholder behind the media (while it loads, or when empty). */
  surface?: boolean;
}

/** Fixed-ratio box for media: direct children (img, video, iframe, a placeholder) fill it. */
export function AspectRatio({ ratio = 16 / 9, radius, surface, className, style, render, ref, ...props }: AspectRatioProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>(props, {
      className: cn(aspectRatioVariants({ radius, surface }), className),
      style: { aspectRatio: String(ratio), ...style },
    }),
  });
}
