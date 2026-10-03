import { Sankey, Tooltip, type SankeyLinkProps as LinkProps, type SankeyNodeProps as NodeProps } from 'recharts';
import { tooltipContent } from './ChartTooltip';
import { identity, type ValueFormatter } from './format';
import { SAFE_CHART_COLORS } from './palette';
import { accessibleName, ChartFrame } from './shared';
import { ChartDataTable, resolveState, type ChartStateProps } from './states';
import { seriesColor, useChartTheme, type ChartColor } from './theme';

export interface SankeyNodeDatum {
  name: string;
  /** Series colour of the node (and of its outgoing flows). Default: cycles `colors`. */
  color?: ChartColor;
}

export interface SankeyLinkDatum {
  /** Source node: its name or its index in `nodes`. */
  source: string | number;
  /** Target node: its name or its index in `nodes`. */
  target: string | number;
  value: number;
}

export interface SankeyChartProps extends ChartStateProps {
  nodes: readonly SankeyNodeDatum[];
  links: readonly SankeyLinkDatum[];
  colors?: readonly ChartColor[];
  valueFormatter?: ValueFormatter;
  /** Plot height in px. */
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  'aria-label'?: string;
  title?: string;
  description?: string;
  className?: string;
}

interface ResolvedLink {
  source: number;
  target: number;
  value: number;
}

/** Turns name-or-index links into the index links Recharts expects; drops unknown endpoints and non-positive values. */
export function resolveSankeyLinks(nodes: readonly SankeyNodeDatum[], links: readonly SankeyLinkDatum[]): ResolvedLink[] {
  const byName = new Map(nodes.map((n, i) => [n.name, i]));
  const idx = (ref: string | number) =>
    typeof ref === 'number' ? (ref >= 0 && ref < nodes.length ? ref : undefined) : byName.get(ref);
  const out: ResolvedLink[] = [];
  for (const l of links) {
    const source = idx(l.source);
    const target = idx(l.target);
    if (source === undefined || target === undefined || source === target || !(l.value > 0)) continue;
    out.push({ source, target, value: l.value });
  }
  return out;
}

/** Flow diagram: nodes as token-coloured bars, links tinted with their source colour. */
export function SankeyChart({
  nodes,
  links,
  colors = SAFE_CHART_COLORS,
  valueFormatter = identity,
  height = 320,
  nodeWidth = 10,
  nodePadding = 18,
  title,
  description,
  className,
  'aria-label': ariaLabel,
  state,
  emptyMessage,
  errorMessage,
  onRetry,
  dataTable = false,
}: SankeyChartProps) {
  const t = useChartTheme();
  const resolved = resolveSankeyLinks(nodes, links);
  const fills = nodes.map((n, i) => (n.color ? t.color(n.color) : seriesColor(t, colors, i)));
  const sources = new Set(resolved.map((l) => l.source));
  const name = accessibleName(
    'Sankey chart',
    ariaLabel,
    title,
    nodes.map((n) => n.name),
  );
  const data = {
    nodes: nodes.map((n, i) => ({ name: n.name, fill: fills[i] })),
    links: resolved,
  };

  const renderNode = ({ x, y, width, height: h, index }: NodeProps) => {
    const sink = !sources.has(index);
    return (
      <g>
        <rect x={x} y={y} width={width} height={Math.max(h, 1)} rx={2} fill={fills[index]} />
        <text
          x={sink ? x - 6 : x + width + 6}
          y={y + h / 2}
          dy="0.35em"
          textAnchor={sink ? 'end' : 'start'}
          fontSize={11}
          fill={t.text}
        >
          {nodes[index]?.name}
        </text>
      </g>
    );
  };
  const renderLink = (p: LinkProps) => {
    const source = resolved[p.index]?.source ?? 0;
    return (
      <path
        d={`M${p.sourceX},${p.sourceY} C${p.sourceControlX},${p.sourceY} ${p.targetControlX},${p.targetY} ${p.targetX},${p.targetY}`}
        fill="none"
        stroke={fills[source] ?? t.color('primary')}
        strokeOpacity={0.28}
        strokeWidth={Math.max(p.linkWidth, 1)}
      />
    );
  };

  return (
    <ChartFrame
      label={name}
      state={resolveState(state, resolved.length)}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      height={height}
      className={className}
      table={
        dataTable && (
          <ChartDataTable
            caption={name}
            columns={['From', 'To', 'Value']}
            rows={resolved.map((l) => [nodes[l.source]?.name ?? '', nodes[l.target]?.name ?? '', valueFormatter(l.value)])}
          />
        )
      }
    >
      <Sankey
        data={data}
        nameKey="name"
        nodeWidth={nodeWidth}
        nodePadding={nodePadding}
        margin={{ top: 6, right: 96, bottom: 6, left: 6 }}
        node={renderNode}
        link={renderLink}
        accessibilityLayer
        title={title}
        desc={description}
      >
        <Tooltip isAnimationActive={false} content={tooltipContent({ valueFormatter })} />
      </Sankey>
    </ChartFrame>
  );
}
