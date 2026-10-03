import type { ReactElement, ReactNode } from 'react';
import { ChartBrush, useChartRange, type ChartRange } from './ChartBrush';
import type { ValueFormatter } from './format';
import { usePrefersReducedMotion } from './live';
import { annotationKey, ChartMarkers, referenceElements, useActiveAnnotation, type ChartAnnotation, type ChartThreshold } from './overlays';
import { field, numField } from './shared';

/** Thresholds, annotations, brush zoom and animation: shared by Line, Area, Bar and Combo charts. */
export interface CartesianExtrasProps {
  /** Horizontal reference lines on the value axis, each with a visible label and a tone. */
  thresholds?: readonly ChartThreshold[];
  /** Vertical markers at x values (deploys, incidents), with a label and a tooltip. */
  annotations?: readonly ChartAnnotation[];
  /** Shows a range brush under the plot to zoom into part of the series. */
  brush?: boolean;
  /** Controlled brush range: inclusive `[start, end]` indices into `data`. */
  range?: ChartRange;
  /** Initial brush range (uncontrolled). Default: every point. */
  defaultRange?: ChartRange;
  onRangeChange?: (range: ChartRange) => void;
  /** Animate data changes (e.g. a live series). Always off under prefers-reduced-motion. Default false. */
  animate?: boolean;
}

export interface CartesianExtrasOptions {
  valueFormatter?: ValueFormatter;
  /** Series drawn in the brush overview. */
  previewKey?: string;
  /** Bar charts with `layout="vertical"`. */
  vertical?: boolean;
  /** ComboChart: Recharts yAxisId for a threshold axis. */
  yAxisIdOf?: (axis: 'left' | 'right') => string;
}

export interface CartesianExtras<T> {
  /** The data to plot (the brushed slice when `brush` is on). */
  view: readonly T[];
  /** `<ReferenceLine>` children for thresholds and annotations. */
  references: ReactElement[];
  /** Marker list and brush, rendered under the plot. */
  footer: ReactNode;
  /** Spread on Recharts series: animation only when asked for and motion is allowed. */
  animation: { isAnimationActive: boolean; animationDuration: number };
}

export function useCartesianExtras<T extends object>(
  data: readonly T[],
  index: string,
  { thresholds = [], annotations = [], brush = false, range, defaultRange, onRangeChange, animate = false }: CartesianExtrasProps,
  { valueFormatter, previewKey, vertical = false, yAxisIdOf }: CartesianExtrasOptions = {},
): CartesianExtras<T> {
  const [current, setRange] = useChartRange({ length: data.length, range, defaultRange, onRangeChange });
  const [active, setActive] = useActiveAnnotation();
  const reduced = usePrefersReducedMotion();
  const view = brush ? data.slice(current[0], current[1] + 1) : data;
  const categories = new Set(view.map((d) => String(field(d, index))));
  const shown = annotations.filter((a) => categories.has(String(a.x)));
  const references = referenceElements({
    thresholds,
    annotations: shown,
    vertical,
    categories,
    activeAnnotation: active,
    onActiveAnnotation: setActive,
    yAxisIdOf,
  });
  const labelOf = (i: number) => {
    const d = data[i];
    return d ? String(field(d, index)) : '';
  };
  const footer = (
    <>
      <ChartMarkers
        thresholds={thresholds}
        annotations={shown}
        valueFormatter={valueFormatter}
        active={active && shown.some((a) => annotationKey(a) === active) ? active : null}
        onActiveChange={setActive}
      />
      {brush && (
        <ChartBrush
          length={data.length}
          range={current}
          onRangeChange={setRange}
          labelOf={labelOf}
          preview={previewKey ? data.map((d) => numField(d, previewKey)) : undefined}
        />
      )}
    </>
  );
  return { view, references, footer, animation: { isAnimationActive: animate && !reduced, animationDuration: 300 } };
}
