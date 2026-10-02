/** Node status → brand colour. Green = active/healthy (never severity); amber = degraded;
 *  red = failed; violet/rose = needs a human (handoff / review). */
export type FlowTone = 'running' | 'degraded' | 'failed' | 'paused' | 'done' | 'handoff' | 'review';

/** The role of a node, which decides its handles and its icon chip. */
export type FlowNodeKind = 'trigger' | 'step' | 'router' | 'output';

export interface FlowToneStyle {
  label: string;
  /** Pill background + text (contrast-safe text aliases). */
  pill: string;
  /** Status dot. */
  dot: string;
  /** Thick card border, or null for the neutral border. */
  border: string | null;
  /** Brand token used for the minimap swatch. */
  token: string;
  /** Draws the marching segment around the card. */
  march?: boolean;
}

export const FLOW_TONES: Record<FlowTone, FlowToneStyle> = {
  running: { label: 'Running', pill: 'bg-primary/14 text-primary-text', dot: 'bg-primary', border: 'border-primary/60', token: '--primary', march: true },
  degraded: { label: 'Degraded', pill: 'bg-warning/16 text-warning-text', dot: 'bg-warning', border: 'border-warning/65', token: '--warning' },
  failed: { label: 'Failed', pill: 'bg-destructive/15 text-destructive-text', dot: 'bg-destructive', border: 'border-destructive/65', token: '--destructive' },
  paused: { label: 'Paused', pill: 'bg-muted-foreground/16 text-muted-foreground', dot: 'bg-muted-foreground', border: null, token: '--muted-foreground' },
  done: { label: 'Done', pill: 'bg-primary/14 text-primary-text', dot: 'bg-primary', border: 'border-primary/70', token: '--primary' },
  handoff: { label: 'Handoff', pill: 'bg-category-violet/16 text-foreground', dot: 'bg-category-violet', border: 'border-category-violet', token: '--category-violet' },
  review: { label: 'Review', pill: 'bg-category-rose/16 text-foreground', dot: 'bg-category-rose', border: 'border-category-rose', token: '--category-rose' },
};

/** Icon chip per node kind. */
export const KIND_CHIP: Record<FlowNodeKind, string> = {
  trigger: 'bg-primary text-primary-foreground',
  step: 'bg-primary/14 text-primary-text',
  router: 'border border-border bg-secondary text-foreground',
  output: 'bg-accent text-accent-foreground',
};

export function isFlowTone(v: unknown): v is FlowTone {
  return typeof v === 'string' && v in FLOW_TONES;
}

/** Token for a node's minimap swatch: its tone, else muted for routers, else primary. */
export function nodeToken(tone: unknown, kind: unknown): string {
  if (isFlowTone(tone)) return FLOW_TONES[tone].token;
  return kind === 'router' ? '--muted-foreground' : '--primary';
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
