import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { CSSProperties } from 'react';
import { responsiveClasses, type Responsive } from '../../utils/responsive';
import { cn } from '../../utils/cn';
import type { SpaceScale } from '../Stack/stack.variants';
import { GRID_GAP, ROW_GAP, COLUMN_GAP } from './grid-gap.variants';
import type { LayoutElement } from '../Stack/Stack';
import {
  COL_SPAN,
  COL_SPAN_FULL,
  GRID_COLS,
  gridVariants,
  type GridColumns,
  type GridVariantProps,
} from './grid.variants';

export type { Responsive } from '../../utils/responsive';

export interface GridProps extends Omit<useRender.ComponentProps<'div'>, 'className'> {
  className?: string;
  as?: LayoutElement;
  /** Column count (1–12), or one per breakpoint: `{ base: 1, md: 2, xl: 4 }`. */
  cols?: Responsive<GridColumns>;
  /**
   * Auto-fill as many columns as fit, each at least this wide (`'14rem'`, or a number in px).
   * Overrides `cols`.
   */
  minChildWidth?: string | number;
  /** Gap on the spacing scale (0–12). */
  gap?: Responsive<SpaceScale>;
  /** Separate row gap (otherwise `gap` applies to both axes). */
  rowGap?: Responsive<SpaceScale>;
  /** Separate column gap (otherwise gap applies to both axes). */
  columnGap?: Responsive<SpaceScale>;
  align?: GridVariantProps['align'];
  flow?: GridVariantProps['flow'];
}

/** CSS grid with a responsive column count or an auto-fill minimum child width. */
export function Grid({
  as = 'div',
  cols,
  minChildWidth,
  gap = 4,
  rowGap,
  columnGap,
  align,
  flow,
  className,
  style,
  render,
  ref,
  ...props
}: GridProps) {
  const autoFill: CSSProperties | undefined =
    minChildWidth != null
      ? {
          gridTemplateColumns: `repeat(auto-fill, minmax(min(${
            typeof minChildWidth === 'number' ? `${minChildWidth}px` : minChildWidth
          }, 100%), 1fr))`,
        }
      : undefined;
  return useRender({
    defaultTagName: as,
    render,
    ref,
    props: mergeProps<'div'>(props, {
      className: cn(
        gridVariants({ align, flow }),
        minChildWidth == null && responsiveClasses(cols, GRID_COLS),
        responsiveClasses(gap, GRID_GAP),
        responsiveClasses(rowGap, ROW_GAP),
        responsiveClasses(columnGap, COLUMN_GAP),
        className,
      ),
      style: autoFill || style ? { ...autoFill, ...style } : undefined,
    }),
  });
}

export interface GridItemProps extends Omit<useRender.ComponentProps<'div'>, 'className'> {
  className?: string;
  as?: LayoutElement;
  /** Columns to span (1–12 or `'full'`), or one per breakpoint. */
  span?: Responsive<GridColumns | 'full'>;
}

/** A grid cell that spans several columns. */
export function GridItem({ as = 'div', span, className, render, ref, ...props }: GridItemProps) {
  return useRender({
    defaultTagName: as,
    render,
    ref,
    props: mergeProps<'div'>(props, {
      className: cn(
        'min-w-0',
        responsiveClasses(span, (bp, n) => (n === 'full' ? COL_SPAN_FULL[bp] : COL_SPAN[bp][n])),
        className,
      ),
    }),
  });
}
