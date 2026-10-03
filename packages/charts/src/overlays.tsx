import { useId, useState, type ReactElement } from 'react';
import { ReferenceLine } from 'recharts';
import { cx, type ValueFormatter } from './format';
import { legendFocus } from './ChartLegend';

/** Semantic tone of a threshold or annotation (maps to a brand token, never a raw colour). */
export type ChartTone = 'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';

/** A horizontal reference line on the value axis (an SLO, a budget, a limit). */
export interface ChartThreshold {
  /** Value on the value axis. */
  value: number;
  /** Visible label drawn next to the line (thresholds are never colour-only). */
  label: string;
  tone?: ChartTone;
  /** ComboChart only: the axis the value belongs to (default `left`, the bar axis). */
  axis?: 'left' | 'right';
}

/** A vertical marker at an x (category) value: a deploy, an incident, a release. */
export interface ChartAnnotation {
  /** Category value on the x axis (must match an `index` value of the data). */
  x: string | number;
  /** Short visible label (drawn on the marker and listed under the chart). */
  label: string;
  /** Longer text shown in the marker tooltip and read by screen readers. */
  description?: string;
  tone?: ChartTone;
}

/** Stroke token and contrast-safe text token of each tone. */
export const TONE_TOKENS: Record<ChartTone, { stroke: string; text: string }> = {
  neutral: { stroke: '--muted-foreground', text: '--muted-foreground' },
  primary: { stroke: '--primary', text: '--primary-text' },
  success: { stroke: '--success', text: '--success-text' },
  warning: { stroke: '--warning', text: '--warning-text' },
  destructive: { stroke: '--destructive', text: '--destructive-text' },
  info: { stroke: '--info', text: '--foreground' },
};

const v = (token: string) => `hsl(var(${token}))`;
/** Dash patterns: thresholds are long dashes, annotations short dots — shape, not only colour. */
export const THRESHOLD_DASH = '6 4';
export const ANNOTATION_DASH = '2 3';

/** A stable key for an annotation (x + label). */
export const annotationKey = (a: ChartAnnotation) => `${String(a.x)}::${a.label}`;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}
function boxOf(props: unknown, key: 'viewBox' | 'parentViewBox' = 'viewBox'): Box | null {
  const vb = (props as Record<string, Partial<Box> | undefined> | null)?.[key];
  if (!vb || typeof vb.x !== 'number' || typeof vb.y !== 'number') return null;
  return { x: vb.x, y: vb.y, width: vb.width ?? 0, height: vb.height ?? 0 };
}
function plotRightOf(props: unknown): number | undefined {
  const parent = boxOf(props, 'parentViewBox');
  return parent ? parent.x + parent.width : undefined;
}

function ThresholdLabel(props: { label: string; tone: ChartTone; vertical: boolean }) {
  const { label, tone, vertical } = props;
  const box = boxOf(props);
  if (!box) return null;
  const fill = v(TONE_TOKENS[tone].text);
  if (vertical) {
    return (
      <text x={box.x + 4} y={box.y + 12} fill={fill} fontSize={11} fontWeight={500} data-chart-threshold-label="">
        {label}
      </text>
    );
  }
  return (
    <text x={box.x + box.width - 4} y={box.y - 5} textAnchor="end" fill={fill} fontSize={11} fontWeight={500} data-chart-threshold-label="">
      {label}
    </text>
  );
}

function AnnotationMarker({
  box,
  annotation,
  active,
  onActive,
  plotRight,
}: {
  box: Box;
  plotRight?: number;
  annotation: ChartAnnotation;
  active: boolean;
  onActive: (key: string | null) => void;
}) {
  const tone = annotation.tone ?? 'neutral';
  const key = annotationKey(annotation);
  const tip = annotation.description ? `${annotation.label}: ${annotation.description}` : annotation.label;
  const tipWidth = Math.min(240, Math.max(90, tip.length * 6.2 + 16));
  // Keep the tooltip inside the plot: flip it to the left of the marker near the right edge.
  const flip = plotRight != null && box.x + tipWidth + 12 > plotRight;
  const tipX = flip ? box.x - tipWidth - 8 : box.x + 8;
  return (
    // Pointer affordance only: keyboard and screen-reader users get the same text from the marker list.
    <g
      aria-hidden
      data-chart-annotation={key}
      data-active={active || undefined}
      onPointerEnter={() => onActive(key)}
      onPointerLeave={() => onActive(null)}
      style={{ cursor: 'default' }}
    >
      <title>{tip}</title>
      {/* Flag glyph at the top of the marker (a shape cue besides the colour). */}
      <path d={`M${box.x},${box.y} l7,4 l-7,4 z`} fill={v(TONE_TOKENS[tone].stroke)} />
      <text x={box.x + 10} y={box.y + 8} fill={v(TONE_TOKENS[tone].text)} fontSize={11} fontWeight={active ? 600 : 500}>
        {annotation.label}
      </text>
      {/* Wide invisible hit area along the line. */}
      <rect x={box.x - 6} y={box.y} width={12} height={Math.max(box.height, 1)} fill="transparent" />
      {active && (
        <g data-chart-annotation-tooltip="">
          <rect
            x={tipX}
            y={box.y + 14}
            width={tipWidth}
            height={24}
            rx={6}
            fill={v('--popover')}
            stroke={v('--border')}
          />
          <text x={tipX + 8} y={box.y + 30} fill={v('--popover-foreground')} fontSize={11.5}>
            {tip}
          </text>
        </g>
      )}
    </g>
  );
}

/** Recharts clones a label element with the line's `viewBox` (and the plot's `parentViewBox`). */
function AnnotationLabel(props: { annotation: ChartAnnotation; active: boolean; onActive: (key: string | null) => void }) {
  const box = boxOf(props);
  if (!box) return null;
  return <AnnotationMarker box={box} plotRight={plotRightOf(props)} annotation={props.annotation} active={props.active} onActive={props.onActive} />;
}

export interface ReferenceElementsOptions {
  thresholds?: readonly ChartThreshold[];
  annotations?: readonly ChartAnnotation[];
  /** Bar charts with `layout="vertical"` swap the axes (value on x, categories on y). */
  vertical?: boolean;
  /** Category values currently plotted (annotations outside are skipped). */
  categories: ReadonlySet<string>;
  activeAnnotation: string | null;
  onActiveAnnotation: (key: string | null) => void;
  /** ComboChart: map a threshold axis to the Recharts yAxisId. */
  yAxisIdOf?: (axis: 'left' | 'right') => string;
}

/**
 * Recharts `<ReferenceLine>` elements for thresholds and annotations. Returned as an array so
 * they are direct children of the chart.
 */
export function referenceElements({
  thresholds = [],
  annotations = [],
  vertical = false,
  categories,
  activeAnnotation,
  onActiveAnnotation,
  yAxisIdOf,
}: ReferenceElementsOptions): ReactElement[] {
  const out: ReactElement[] = [];
  thresholds.forEach((th, i) => {
    const tone = th.tone ?? 'neutral';
    const pos = vertical ? { x: th.value } : { y: th.value };
    out.push(
      <ReferenceLine
        key={`threshold-${i}`}
        {...pos}
        {...(yAxisIdOf ? { yAxisId: yAxisIdOf(th.axis ?? 'left') } : {})}
        stroke={v(TONE_TOKENS[tone].stroke)}
        strokeWidth={1.5}
        strokeDasharray={THRESHOLD_DASH}
        ifOverflow="extendDomain"
        label={<ThresholdLabel label={th.label} tone={tone} vertical={vertical} />}
      />,
    );
  });
  annotations.forEach((a) => {
    if (!categories.has(String(a.x))) return;
    const key = annotationKey(a);
    const active = activeAnnotation === key;
    const pos = vertical ? { y: a.x } : { x: a.x };
    out.push(
      <ReferenceLine
        key={`annotation-${key}`}
        {...pos}
        {...(yAxisIdOf ? { yAxisId: yAxisIdOf('left') } : {})}
        stroke={v(TONE_TOKENS[a.tone ?? 'neutral'].stroke)}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={ANNOTATION_DASH}
        label={<AnnotationLabel annotation={a} active={active} onActive={onActiveAnnotation} />}
      />,
    );
  });
  return out;
}

export interface ChartMarkersProps {
  thresholds?: readonly ChartThreshold[];
  annotations?: readonly ChartAnnotation[];
  /** Formats threshold values (the chart's value formatter). */
  valueFormatter?: ValueFormatter;
  /** Key of the annotation highlighted in the plot. */
  active?: string | null;
  onActiveChange?: (key: string | null) => void;
  className?: string;
}

/**
 * Text list of the thresholds and annotations under a chart: the keyboard and screen-reader
 * route to the same information as the in-plot markers. Focusing or hovering an annotation
 * highlights its marker and opens its tooltip in the plot.
 */
export function ChartMarkers({ thresholds = [], annotations = [], valueFormatter, active = null, onActiveChange, className }: ChartMarkersProps) {
  const id = useId();
  if (thresholds.length === 0 && annotations.length === 0) return null;
  const fmt = (n: number) => (valueFormatter ? valueFormatter(n) : String(n));
  return (
    <ul aria-label="Chart markers" className={cx('mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[12px] text-muted-foreground', className)}>
      {thresholds.map((th, i) => (
        <li key={`t-${i}`} className="flex items-center gap-1.5" data-chart-marker="threshold">
          <svg aria-hidden width="18" height="4" className="shrink-0">
            <line x1="0" y1="2" x2="18" y2="2" stroke={v(TONE_TOKENS[th.tone ?? 'neutral'].stroke)} strokeWidth={1.5} strokeDasharray={THRESHOLD_DASH} />
          </svg>
          <span>
            <span className="sr-only">Threshold:</span> {th.label} <span className="font-mono tabular-nums">({fmt(th.value)})</span>
          </span>
        </li>
      ))}
      {annotations.map((a) => {
        const key = annotationKey(a);
        const descId = `${id}-${key}`;
        return (
          <li key={key} data-chart-marker="annotation">
            <button
              type="button"
              aria-describedby={a.description ? descId : undefined}
              onFocus={() => onActiveChange?.(key)}
              onBlur={() => onActiveChange?.(null)}
              onPointerEnter={() => onActiveChange?.(key)}
              onPointerLeave={() => onActiveChange?.(null)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onActiveChange?.(null);
              }}
              className={cx('flex items-center gap-1.5 hover:text-foreground', active === key && 'text-foreground', legendFocus)}
            >
              <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
                <path d="M1,1 l8,4 l-8,4 z" fill={v(TONE_TOKENS[a.tone ?? 'neutral'].stroke)} />
              </svg>
              <span>
                <span className="sr-only">{`Marker at ${String(a.x)}:`}</span> {a.label}
              </span>
            </button>
            {a.description && (
              <span id={descId} className="sr-only">
                {a.description}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** State of the highlighted annotation (shared by the plot markers and the marker list). */
export function useActiveAnnotation() {
  return useState<string | null>(null);
}
