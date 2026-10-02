import type { ReactNode } from 'react';
import { KindGlyph } from './glyphs';
import { cx, FLOW_TONES, KIND_CHIP, type FlowNodeKind, type FlowTone } from './tones';

export interface NodeCardProps {
  kind?: FlowNodeKind;
  title: string;
  subtitle?: string;
  /** Footer text (left), e.g. a version or an owner. */
  meta?: string;
  /** Icon element (decorative); defaults to the kind's glyph. */
  icon?: ReactNode;
  tone?: FlowTone;
  selected?: boolean;
  className?: string;
}

/** The brand node card, without handles (reused by the node types and static galleries). */
export function NodeCard({ kind = 'step', icon, title, subtitle, meta, tone, selected, className }: NodeCardProps) {
  const t = tone ? FLOW_TONES[tone] : undefined;
  const running = Boolean(t?.march);
  const border = selected
    ? 'border-2 border-primary/60 shadow-md ring-2 ring-primary/35'
    : t?.border
      ? cx('border-2 shadow-sm', t.border)
      : 'border border-border shadow-sm';
  return (
    <div className={cx('relative h-full w-full min-w-52', className)} data-tone={tone}>
      {running && (
        <svg aria-hidden="true" width="100%" height="100%" className="gu-flow-run-frame pointer-events-none absolute inset-0 z-10">
          <rect className="gu-flow-run fill-none stroke-primary" strokeWidth={2} strokeLinecap="round" pathLength={100} strokeDasharray="22 78" />
        </svg>
      )}
      <div className={cx('flex h-full w-full flex-col overflow-hidden rounded-lg bg-card transition-shadow', border)}>
        <div className="flex flex-1 items-center gap-2.5 px-3 py-2.5">
          <span aria-hidden className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg', KIND_CHIP[kind])}>
            {icon ?? <KindGlyph kind={kind} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-sans text-[12.5px] leading-tight font-semibold text-foreground">{title}</div>
            {subtitle && <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{subtitle}</div>}
          </div>
        </div>
        {(meta || t) && (
          <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-secondary/25 px-3 py-2">
            {meta ? <span className="truncate font-mono text-[10px] text-muted-foreground">{meta}</span> : <span />}
            {t && (
              <span className={cx('inline-flex h-[18px] shrink-0 items-center gap-1 rounded px-1.5 font-mono text-[9.5px] font-semibold', t.pill)}>
                <span aria-hidden className={cx('h-1.5 w-1.5 rounded-full', t.dot, running && 'animate-pulse motion-reduce:animate-none')} />
                {t.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
