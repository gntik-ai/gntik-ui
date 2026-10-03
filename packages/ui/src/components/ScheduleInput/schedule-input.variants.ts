import { tv, type VariantProps } from '../../utils/tv';

/** Preset row, raw cron field, plain-language summary and the upcoming runs list. */
export const scheduleInputVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col gap-4',
    editors: 'flex flex-wrap items-end gap-x-4 gap-y-3',
    editor: 'flex min-w-0 flex-col gap-1.5',
    editorLabel: 'text-[12px] font-medium text-muted-foreground',
    expression: 'font-mono',
    hint: 'font-mono text-[11px] text-muted-foreground',
    error: 'text-[12px] font-medium text-destructive-text',
    summary: 'flex items-start gap-2 text-[13px] font-medium text-foreground',
    summaryIcon: 'mt-0.5 shrink-0 text-muted-foreground',
    runs: 'flex flex-col gap-1.5 rounded-md border border-border bg-card p-3',
    runsHeading: 'text-[11.5px] font-medium text-muted-foreground',
    runsList: 'grid gap-1 font-mono text-[12px] text-foreground tabular-nums',
    empty: 'text-[12px] text-muted-foreground',
  },
  variants: {
    disabled: { true: { root: 'opacity-60' } },
  },
});

export type ScheduleInputVariantProps = VariantProps<typeof scheduleInputVariants>;
