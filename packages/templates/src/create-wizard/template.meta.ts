import type { TemplateMeta } from '../meta';

export const meta = {
  name: 'Create wizard',
  family: 'Resources',
  priority: 'P2',
  status: 'beta',
  description: `Focus-mode create flow on WizardLayout. Without flowSteps, the existing details, source, configuration and editable review flow, CreateWizardProps, copy and defaults are unchanged. Page mode is the default; mode="overlay" keeps the parent list mounted without a route change. Overlay size defaults to fullscreen; size="dialog" uses a popup (fullscreen on mobile). Legacy closing preserves answers; confirming exit in flow mode resets answers and the current step.

## Caller-defined flow mode

Import CreateWizardPage (or CreateWizardFlow) and CreateWizardFlowProps<V> from @gntik-ai/templates. flowSteps selects the additive generic variant; legacy-only props (steps, copy, sources, regions, title, stepFeedback, onStepChange) cannot mix with it. V is the caller's object type. The kit owns current step, values and validation visibility. The display-only Stepper follows the supplied order and appends review. Zero caller steps renders review directly.

| Prop | Type / behaviour |
| --- | --- |
| flowSteps | readonly { id: string; label: string; readOnly?: boolean; render({ values, setValue, errors }): ReactNode; validate?(values): { fieldErrors?, blocking? } }[]; ids must be unique and stable |
| initialValues | V; used at mount and restored on confirmed exit |
| summary | (values: V) => readonly { stepId: string; label: string; value?: string or null }[] |
| labels | Required CreateWizardFlowLabels; no template-owned visible or accessible copy has a fallback |
| onFinish | (values: V, { signal: AbortSignal }) => void or Promise<unknown>; one signal per attempt |
| onExit | Called once after confirmed exit, after reset and abort; Stay calls nothing |
| onComplete | Uncontrolled only; (result: unknown) => void, once after success is committed and announced |
| submitState | Controlled when provided at mount: {status:'idle'}, {status:'submitting'}, {status:'success', result?:unknown}, or {status:'error', error?:unknown, message?:string} |
| resourceHref | (result: unknown) => string or undefined; only called with a non-null success result |
| errorMessage | (error: unknown) => string or undefined; empty text uses labels.errorFallback |
| confirmExit | Defaults to true; Exit, Escape and overlay Cancel open confirmation. false exits directly |
| mode, size, open, onOpenChange, description, returnFocusRef, closeOnInteractOutside | WizardLayout presentation props; closing itself is not confirmation or reset |

labels supplies title, exit, cancel, back, next, finish, pending, review (Stepper label), reviewTitle (heading), edit(stepLabel), emptyValue, success(result), errorFallback, openResource, exitTitle, exitDescription, exitConfirm, exitCancel, steps (Stepper name), stepsSummary, skipLink, stepStatusText (complete/current/upcoming/error), formatStepCount(position,total) and stepAnnouncement({position,total,label}). Positions are one-based. Step labels, validation messages, summary labels/values and rendered body content also belong to the caller's namespace. Every DescriptionListCard receives the owning step label as its explicit title, labels.edit(stepLabel), explicit items and an empty description. All steps get a card, even with no matching rows; empty values use labels.emptyValue.

## Validation and navigation

validate runs on every render, including caller re-renders (for example members.count quota changes). A non-empty blocking message disables Next immediately. It is visible as ordinary text and announced politely once per new value, including entry and one frame after overlay opening. Clearing blocking re-enables Next without a press. fieldErrors is Partial<Record<keyof V,string>>. Errors become visible after the first Next press on their step and remain live thereafter. With errors, Next does not advance and focuses the first aria-invalid="true" field. Render fields using Field invalid, FieldLabel, Input and FieldError to associate errors and controls. Blocking does not hide visible field errors. A readOnly step must render its fixed value as text, without editable controls; only its blocking result gates Next and its fieldErrors are ignored. Back, Next and review Edit preserve values. Edit returns to the owning step and focuses its heading. No direct Stepper jumps are available.

## Submit ownership and aborts

In uncontrolled mode, Finish shows labels.pending in both presentations. Resolve commits success, announces labels.success(result) politely, then calls onComplete(result) once. Reject keeps values and review, renders errorMessage(error) or labels.errorFallback, announces assertively and re-enables Finish. Identical repeated failures each announce; changing settled error text announces once, unchanged text does not. Visible success, error and blocking text is never a live region. All announcements use useAnnounce from the nearest LiveAnnouncer; the template provides one only when needed. Put LiveAnnouncer at page level when onComplete closes/unmounts the flow, so the message survives.

Controlled mode renders submitState only. Each enabled Finish press calls the existing onFinish once; its returned result never changes kit state and onComplete is never called. The caller must pass through submitting for every attempt, discard completions when signal.aborted, and reset submitState to idle in onExit before reopening. Switching between controlled and uncontrolled after mount is unsupported. AbortSignal is a cancellation contract, not a transport: callers must honor it. Confirmed exit and unmount abort the current attempt. Uncontrolled aborted settlements cannot update state, announce or complete, including an older attempt settling after reopening.

While submitting or after success, Back has backDisabled (aria-disabled but focusable), review cards have no Edit, and Finish is loading or disabled. Exit remains enabled. Pending Finish and locked Back retain focus. A focused control becoming disabled or removed sends focus on success to the resource link, or to the success heading (tabIndex=-1) if no result/href exists; in all other cases it goes to the current heading. Focus never moves to a live region. Page Back/Next preserve focus unless the pressed control becomes disabled. Overlay step changes focus the new heading and announce via LiveAnnouncer. Escape in a portalled Select or Menu stays local.

## Examples

examples/Invite.tsx is a generic single-recipient invite with a read-only workspace context, one email checked against /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, a members.count quota, exactly Owner/Admin/Member roles, and an optional message with maxLength=500. Its copy is one English page namespace. examples/labels.ts lists every required label. UncontrolledPending, UncontrolledSuccess and UncontrolledError cover a never-settling attempt, a success resource link and a failure fallback. ControlledIdle, ControlledSubmitting, ControlledSuccess and ControlledError show each caller-owned state. Every example has a create-wizard--<kebab-name> preview entry; Invite uses create-wizard--invite. The three-theme browser axe loop visits each step, review, submit state and exit confirmation. examples/Overlay.tsx retains the original list-to-overlay project flow with step-local error and empty surfaces.

A controlled caller's onFinish can use this pattern (with its own transport, values and state): setSubmitState({status:'submitting'}); try { const result = await save(values, {signal}); if (!signal.aborted) setSubmitState({status:'success',result}); } catch (error) { if (!signal.aborted) setSubmitState({status:'error',error}); }. onExit resets to idle before reopening. Keep the page-level LiveAnnouncer mounted when closing.

All flow surfaces reuse kit components and existing tokens; no new CSS variables. Themes: dark, light and high_contrast.`,
  layout: 'WizardLayout',
  blocks: ['description-list-card', 'error-panel', 'empty-states'],
  pattern:
    'Caller-defined steps and review with display-only progress; explicit labels; field-error associations; one LiveAnnouncer announcement mechanism; abortable submit lifecycle.',
  keyboard: [
    ['Tab / Shift+Tab', 'Move through Exit, fields, review Edit and footer controls; the Stepper is display-only.'],
    ['Enter / Space on Next', 'Validate; focus the first invalid field, or advance. Blocking disables Next.'],
    [
      'Enter / Space on Back',
      'Return one step; disabled on the first page step and locked while submitting or after success.',
    ],
    ['Enter on Edit', 'Return to the owning step and focus its heading, preserving answers.'],
    [
      'Escape / Exit',
      'Open exit confirmation; Stay does nothing, Leave resets answers and aborts the attempt. Portalled popups handle their own Escape.',
    ],
    [
      'Finish',
      'Call onFinish once when enabled; pending keeps focus, success hands focus to a resource link or the success heading if Finish becomes disabled.',
    ],
  ],
} satisfies TemplateMeta & { pattern: string; keyboard: [string, string][] };
