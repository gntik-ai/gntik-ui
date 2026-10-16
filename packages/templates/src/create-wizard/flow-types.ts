import type { ReactNode } from 'react';
import type { StepStatus, WizardLayoutProps } from '@gntik-ai/ui';

export type CreateWizardFieldErrors<V> = Partial<Record<keyof V, string>>;
export interface CreateWizardFlowStep<V> {
  id: string;
  label: string;
  /** Render fixed values as text. Field errors are ignored on a read-only step. */
  readOnly?: boolean;
  render: (context: {
    values: V;
    setValue: <K extends keyof V>(key: K, value: V[K]) => void;
    errors: CreateWizardFieldErrors<V>;
  }) => ReactNode;
  /** Pure validation, evaluated on every render, including caller re-renders. */
  validate?: (values: V) => { fieldErrors?: CreateWizardFieldErrors<V>; blocking?: string };
}

export interface CreateWizardFlowLabels {
  title: string;
  exit: string;
  cancel: string;
  back: string;
  next: string;
  finish: string;
  pending: string;
  review: string;
  reviewTitle: string;
  edit: (stepLabel: string) => string;
  emptyValue: string;
  success: (result: unknown) => string;
  errorFallback: string;
  openResource: string;
  exitTitle: string;
  exitDescription: string;
  exitConfirm: string;
  exitCancel: string;
  steps: string;
  stepsSummary: string;
  stepStatusText: Record<StepStatus, string>;
  formatStepCount: (position: number, total: number) => string;
  stepAnnouncement: (step: { position: number; total: number; label: ReactNode }) => string;
  skipLink: string;
}

export type CreateWizardSubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; result?: unknown }
  | { status: 'error'; error?: unknown; message?: string };

export interface CreateWizardFlowProps<V extends object> extends Pick<
  WizardLayoutProps,
  | 'mode'
  | 'size'
  | 'open'
  | 'onOpenChange'
  | 'description'
  | 'returnFocusRef'
  | 'closeOnInteractOutside'
  | 'confirmExit'
> {
  flowSteps: readonly CreateWizardFlowStep<V>[];
  initialValues: V;
  summary: (values: V) => readonly { stepId: string; label: string; value?: string | null }[];
  labels: CreateWizardFlowLabels;
  onFinish: (values: V, context: { signal: AbortSignal }) => void | Promise<unknown>;
  onExit: () => void;
  onComplete?: (result: unknown) => void;
  /** Mode is fixed at mount. Controlled callers discard aborted completions and reset to idle on exit. */
  submitState?: CreateWizardSubmitState;
  resourceHref?: (result: unknown) => string | undefined;
  errorMessage?: (error: unknown) => string | undefined;
  /** Legacy-only props cannot mix with flow mode. */
  copy?: never;
  steps?: never;
  sources?: never;
  regions?: never;
  title?: never;
  onStepChange?: never;
  stepFeedback?: never;
  pendingLabel?: never;
  stepAnnouncement?: never;
}
