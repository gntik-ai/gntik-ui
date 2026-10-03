import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../../utils/cn';
import { GAP_CLASSES, centerVariants, stackVariants, type SpaceScale, type StackVariantProps } from './stack.variants';

/** Block-level tags a layout primitive may render as (use `render` for anything else). */
export type LayoutElement =
  | 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav'
  | 'ul' | 'ol' | 'li' | 'form' | 'fieldset' | 'span' | 'dl';

export interface StackProps extends Omit<useRender.ComponentProps<'div'>, 'className'> {
  className?: string;
  /** Tag to render. `render` (Base UI) wins when both are set. */
  as?: LayoutElement;
  /** Main axis. Default `column`. */
  direction?: StackVariantProps['direction'];
  /** Space between children on the spacing scale (0–12 → `gap-0`…`gap-12`). */
  gap?: SpaceScale;
  /** Cross-axis alignment. */
  align?: StackVariantProps['align'];
  /** Main-axis distribution. */
  justify?: StackVariantProps['justify'];
  /** Lets children wrap onto new lines. */
  wrap?: boolean;
  /** Renders `inline-flex`. */
  inline?: boolean;
}

/** Flex layout primitive: one axis, a gap on the spacing scale, alignment and wrapping. */
export function Stack({
  as = 'div',
  direction,
  gap,
  align,
  justify,
  wrap,
  inline,
  className,
  render,
  ref,
  ...props
}: StackProps) {
  return useRender({
    defaultTagName: as,
    render,
    ref,
    props: mergeProps<'div'>(props, {
      className: cn(
        stackVariants({ direction, align, justify, wrap, inline }),
        gap != null && GAP_CLASSES[gap],
        className,
      ),
    }),
  });
}

export type HStackProps = Omit<StackProps, 'direction'> & { reverse?: boolean };

/** Horizontal Stack; children are centred on the cross axis by default. */
export function HStack({ reverse, align = 'center', ...props }: HStackProps) {
  return <Stack direction={reverse ? 'row-reverse' : 'row'} align={align} {...props} />;
}

export type VStackProps = Omit<StackProps, 'direction'> & { reverse?: boolean };

/** Vertical Stack. */
export function VStack({ reverse, ...props }: VStackProps) {
  return <Stack direction={reverse ? 'column-reverse' : 'column'} {...props} />;
}

export interface CenterProps extends Omit<useRender.ComponentProps<'div'>, 'className'> {
  className?: string;
  as?: LayoutElement;
  /** Renders `inline-flex` (e.g. to centre an icon in a fixed box). */
  inline?: boolean;
}

/** Centres its children on both axes. */
export function Center({ as = 'div', inline, className, render, ref, ...props }: CenterProps) {
  return useRender({
    defaultTagName: as,
    render,
    ref,
    props: mergeProps<'div'>(props, { className: cn(centerVariants({ inline }), className) }),
  });
}
