import { DescriptionListCard } from '@gntik-ai/blocks';
import { Heading, Link, LiveAnnouncer, Stack, WizardLayout, useAnnounce, useHasLiveAnnouncer } from '@gntik-ai/ui';
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState } from 'react';
import { useSubmitState } from './useSubmitState';
import type { CreateWizardFlowProps } from './flow-types';
export type {
  CreateWizardFlowProps,
  CreateWizardFlowLabels,
  CreateWizardFlowStep,
  CreateWizardFieldErrors,
  CreateWizardSubmitState,
} from './flow-types';

/** Additive caller-defined flow; the legacy page retains its original props and defaults. */
export function CreateWizardFlow<V extends object>(props: CreateWizardFlowProps<V>) {
  return useHasLiveAnnouncer() ? (
    <Flow {...props} />
  ) : (
    <LiveAnnouncer>
      <Flow {...props} />
    </LiveAnnouncer>
  );
}

function Flow<V extends object>(props: CreateWizardFlowProps<V>) {
  const { flowSteps, initialValues, summary, labels, onExit } = props;
  const { state, finish, reset, successText, errorText } = useSubmitState(props);
  const id = useId();
  const announce = useAnnounce();
  const focused = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState(() =>
    props.submitState && props.submitState.status !== 'idle' ? flowSteps.length : 0,
  );
  const [values, setValues] = useState(initialValues);
  const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());
  const [invalidPress, setInvalidPress] = useState(0);
  const body = useRef<HTMLElement>(null);
  const editFocus = useRef(false);
  const current = flowSteps[step];
  const validation = current?.validate?.(values);
  const fieldErrors = current?.readOnly ? {} : (validation?.fieldErrors ?? {});
  const errors = current && visited.has(current.id) ? fieldErrors : {};
  const blocking = validation?.blocking;
  const locked = state.status === 'submitting' || state.status === 'success';
  const resource = state.status === 'success' && state.result != null ? props.resourceHref?.(state.result) : undefined;
  const headingId = `${id}-heading`;
  const steps = [...flowSteps.map(({ id, label }) => ({ id, label })), { id: `${id}-review`, label: labels.review }];

  const active = props.mode !== 'overlay' || props.open === true;
  useEffect(() => {
    if (!active || !blocking) return;
    const frame = requestAnimationFrame(() => announce(blocking));
    return () => cancelAnimationFrame(frame);
  }, [active, step, blocking, announce]);
  const announceStep = useEffectEvent(() => {
    if (!blocking && (current || state.status === 'idle'))
      announce(
        labels.stepAnnouncement({
          position: step + 1,
          total: flowSteps.length + 1,
          label: current?.label ?? labels.review,
        }),
      );
  });
  useEffect(() => {
    if (!active || props.mode !== 'overlay') return;
    const frame = requestAnimationFrame(() => announceStep());
    return () => cancelAnimationFrame(frame);
  }, [active, step, props.mode]);
  useLayoutEffect(() => {
    const previous = focused.current;
    if (!active || !previous) return;
    const disabled = previous.matches(':disabled');
    const removed = !previous.isConnected;
    if ((disabled || removed) && (document.activeElement === previous || document.activeElement === document.body))
      (state.status === 'success'
        ? (body.current?.querySelector<HTMLElement>('[data-flow-success] a[href]') ??
          body.current?.querySelector<HTMLElement>('[data-flow-success] h2'))
        : body.current?.querySelector<HTMLElement>('h1')
      )?.focus();
  });
  useLayoutEffect(() => {
    if (invalidPress) body.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [invalidPress]);
  useLayoutEffect(() => {
    if (editFocus.current) {
      body.current?.querySelector<HTMLElement>('h1')?.focus();
      editFocus.current = false;
    }
  }, [step]);

  const go = (next: number) => {
    if (locked || (next > step && blocking)) return;
    if (next > step && current) setVisited((previous) => new Set([...previous, current.id]));
    if (next > step && current && Object.values(fieldErrors).some(Boolean)) {
      setInvalidPress((press) => press + 1);
      return;
    }
    setStep(next);
  };
  const rows = current ? [] : summary(values);
  return (
    <WizardLayout
      mode={props.mode}
      size={props.size}
      open={props.open}
      onOpenChange={props.onOpenChange}
      description={props.description}
      returnFocusRef={props.returnFocusRef}
      closeOnInteractOutside={props.closeOnInteractOutside}
      confirmExit={props.confirmExit}
      fullScreen
      title={labels.title}
      steps={steps}
      current={step}
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLElement) focused.current = event.target;
      }}
      onStepChange={go}
      stepsInteractive={false}
      nextDisabled={Boolean(blocking) || state.status === 'success'}
      backDisabled={locked}
      onExit={() => {
        reset();
        setValues(initialValues);
        setStep(0);
        setVisited(new Set());
        setInvalidPress(0);
        onExit();
      }}
      onFinish={() => void finish(values)}
      nextLoading={state.status === 'submitting'}
      exitLabel={labels.exit}
      backLabel={labels.back}
      nextLabel={labels.next}
      finishLabel={state.status === 'submitting' ? labels.pending : labels.finish}
      pendingLabel={labels.pending}
      cancelLabel={labels.cancel}
      stepsLabel={labels.steps}
      stepsSummaryLabel={labels.stepsSummary}
      skipLinkLabel={labels.skipLink}
      stepStatusText={labels.stepStatusText}
      formatStepCount={labels.formatStepCount}
      stepAnnouncement={() => ''}
      exitTitle={labels.exitTitle}
      exitDescription={labels.exitDescription}
      exitConfirmLabel={labels.exitConfirm}
      exitCancelLabel={labels.exitCancel}
    >
      <section ref={body} aria-labelledby={headingId}>
        <Stack gap={6}>
          <Heading level={1} id={headingId} tabIndex={-1} size="lg">
            {current?.label ?? labels.reviewTitle}
          </Heading>
          {current
            ? current.render({
                values,
                setValue: (key, value) => setValues((previous) => ({ ...previous, [key]: value })),
                errors,
              })
            : flowSteps.map((source, index) => (
                <DescriptionListCard
                  key={source.id}
                  titleAs="h2"
                  title={source.label}
                  description=""
                  editLabel={labels.edit(source.label)}
                  onEdit={
                    locked
                      ? undefined
                      : () => {
                          editFocus.current = true;
                          go(index);
                        }
                  }
                  items={rows
                    .filter((row) => row.stepId === source.id)
                    .map((row, rowIndex) => ({
                      id: `${source.id}-${rowIndex}`,
                      label: row.label,
                      value: row.value || labels.emptyValue,
                    }))}
                />
              ))}
          {state.status === 'error' && <p className="text-destructive-text">{errorText}</p>}
          {state.status === 'success' && (
            <div data-flow-success>
              <Heading level={2} tabIndex={-1}>
                {successText}
              </Heading>
              {resource && <Link href={resource}>{labels.openResource}</Link>}
            </div>
          )}
          {blocking && <p className="text-destructive-text">{blocking}</p>}
        </Stack>
      </section>
    </WizardLayout>
  );
}
