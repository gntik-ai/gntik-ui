import { memo } from 'react';
import { cx, FLOW_TONES, type FlowTone } from './tones';

export interface FlowNodeDecoration {
  status?: FlowTone;
  issues?: readonly { code: string; message: string }[];
}

/** Memoized per node: unrelated status changes do not render this badge again. */
export const FlowStatusBadge = memo(function FlowStatusBadge({ status }: { status: FlowTone }) {
  const tone = FLOW_TONES[status];
  return (
    <span
      className={cx(
        'inline-flex h-[18px] shrink-0 items-center gap-1 rounded px-1.5 font-mono text-[9.5px] font-semibold',
        tone.pill,
      )}
    >
      <span
        aria-hidden
        className={cx('h-1.5 w-1.5 rounded-full', tone.dot, tone.march && 'animate-pulse motion-reduce:animate-none')}
      />
      {tone.label}
    </span>
  );
});

export function FlowNodeIssues({ issues }: { issues: FlowNodeDecoration['issues'] }) {
  if (!issues?.length) return null;
  return (
    <div className="absolute top-full left-0 flex w-full items-start gap-1 rounded border border-destructive/65 bg-card p-1 text-[11px] text-destructive-text">
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        className="shrink-0 fill-none stroke-current"
        strokeWidth="2"
      >
        <path d="m12 3 10 18H2Z M12 9v5 M12 17v1" />
      </svg>
      <span>
        <span className="sr-only">Validation issue: </span>
        {issues.map((issue) => issue.message).join('; ')}
      </span>
    </div>
  );
}
