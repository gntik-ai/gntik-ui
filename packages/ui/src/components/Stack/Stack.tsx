import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import {
  isResponsiveObject,
  responsiveClasses,
  type Responsive,
  type ResponsiveClassTable,
} from '../../utils/responsive';
import { STACK_PADDING, STACK_PADDING_INLINE, STACK_PADDING_BLOCK } from './stack-padding.variants';
import { cn } from '../../utils/cn';
import {
  GRID_GAP,
  STACK_DIRECTION,
  STACK_ALIGN,
  STACK_JUSTIFY,
  STACK_WRAP,
  centerVariants,
  stackVariants,
  type SpaceScale,
  type StackVariantProps,
} from './stack.variants';

/** Block-level tags a layout primitive may render as (use `render` for anything else). */
export type LayoutElement =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'ul'
  | 'ol'
  | 'li'
  | 'form'
  | 'fieldset'
  | 'span'
  | 'dl';

export interface StackProps extends Omit<useRender.ComponentProps<'div'>, 'className'> {
  className?: string;
  /** Tag to render. `render` (Base UI) wins when both are set. */
  as?: LayoutElement;
  /** Main axis, optionally per breakpoint. Defaults to `column` below the first entry. */
  direction?: Responsive<NonNullable<StackVariantProps['direction']>>;
  /** Space between children on the spacing scale (0–12 → `gap-0`…`gap-12`). */
  gap?: Responsive<SpaceScale>;
  /** Cross-axis alignment, optionally per breakpoint. */
  align?: Responsive<NonNullable<StackVariantProps['align']>>;
  /** Main-axis distribution, optionally per breakpoint. */
  justify?: Responsive<NonNullable<StackVariantProps['justify']>>;
  /** Lets children wrap onto new lines, optionally per breakpoint. Defaults to nowrap. */
  wrap?: Responsive<boolean>;
  /** Padding on all sides, on the spacing scale (0–12), optionally per breakpoint. */
  padding?: Responsive<SpaceScale>;
  /** Inline-axis padding, optionally per breakpoint; overrides padding on this axis. */
  paddingInline?: Responsive<SpaceScale>;
  /** Block-axis padding, optionally per breakpoint; overrides padding on this axis. */
  paddingBlock?: Responsive<SpaceScale>;
  /** Renders `inline-flex`. */
  inline?: boolean;
}

function baseValue<T>(value: Responsive<T> | undefined): T | undefined {
  return isResponsiveObject(value) ? value.base : value;
}

// Base values stay in stackVariants to preserve the exact scalar class order.
function aboveBase<T extends string | number | boolean>(value: Responsive<T> | undefined, table: ResponsiveClassTable) {
  return isResponsiveObject(value) ? responsiveClasses({ ...value, base: undefined }, table) : [];
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
  padding,
  paddingInline,
  paddingBlock,
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
        stackVariants({
          direction: baseValue(direction),
          align: baseValue(align),
          justify: baseValue(justify),
          wrap: baseValue(wrap),
          inline,
        }),
        aboveBase(direction, STACK_DIRECTION),
        aboveBase(align, STACK_ALIGN),
        aboveBase(justify, STACK_JUSTIFY),
        aboveBase(wrap, STACK_WRAP),
        responsiveClasses(gap, GRID_GAP),
        responsiveClasses(padding, STACK_PADDING),
        responsiveClasses(paddingInline, STACK_PADDING_INLINE),
        responsiveClasses(paddingBlock, STACK_PADDING_BLOCK),
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
