import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { CSSProperties } from 'react';
import { cn } from '../../utils/cn';
import { GAP_CLASSES, type SpaceScale } from '../Stack/stack.variants';
import type { LayoutElement } from '../Stack/Stack';
import {
  COL_SPAN,
  COL_SPAN_FULL,
  GRID_COLS,
  gridVariants,
  type GridBreakpoint,
  type GridColumns,
  type GridVariantProps,
} from './grid.variants';

/** A value per breakpoint (mobile-first: `base` applies below `sm`). */
export type Responsive<T> = T | Partial<Record<GridBreakpoint, T>>;

const BREAKPOINTS: GridBreakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

function responsiveClasses<T>(value: Responsive<T> | undefined, pick: (bp: GridBreakpoint, v: T) => string) {
  if (value == null) return [];
  if (typeof value !== 'object') return [pick('base', value)];
  const map = value as Partial<Record<GridBreakpoint, T>>;
  return BREAKPOINTS.flatMap((bp) => {
    const v = map[bp];
    return v == null ? [] : [pick(bp, v)];
  });
}

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
  gap?: SpaceScale;
  /** Separate row gap (otherwise `gap` applies to both axes). */
  rowGap?: SpaceScale;
  align?: GridVariantProps['align'];
  flow?: GridVariantProps['flow'];
}

const ROW_GAP: Record<SpaceScale, string> = {
  0: 'gap-y-0', 1: 'gap-y-1', 2: 'gap-y-2', 3: 'gap-y-3', 4: 'gap-y-4', 5: 'gap-y-5', 6: 'gap-y-6',
  7: 'gap-y-7', 8: 'gap-y-8', 9: 'gap-y-9', 10: 'gap-y-10', 11: 'gap-y-11', 12: 'gap-y-12',
};

/** CSS grid with a responsive column count or an auto-fill minimum child width. */
export function Grid({
  as = 'div',
  cols,
  minChildWidth,
  gap = 4,
  rowGap,
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
        minChildWidth == null && responsiveClasses(cols, (bp, n) => GRID_COLS[bp][n]),
        GAP_CLASSES[gap],
        rowGap != null && ROW_GAP[rowGap],
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
