import { useAnnounce } from '@gntik-ai/ui';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { CreateWizardFlowProps, CreateWizardSubmitState } from './flow-types';

const IDLE: CreateWizardSubmitState = { status: 'idle' };

/** Owns attempts, never transport; controlled callers own all settled state. */
export function useSubmitState<V extends object>(props: CreateWizardFlowProps<V>) {
  const [controlled] = useState(() => props.submitState !== undefined);
  const [internal, setInternal] = useState<CreateWizardSubmitState>({ status: 'idle' });
  const attempt = useRef<AbortController | null>(null);
  const state = controlled ? (props.submitState ?? IDLE) : internal;
  const announce = useAnnounce();
  const previous = useRef(state.status);
  const lastError = useRef('');
  const complete = useEffectEvent((result: unknown) => props.onComplete?.(result));
  const errorText =
    state.status === 'error' ? state.message || props.errorMessage?.(state.error) || props.labels.errorFallback : '';
  const successText = state.status === 'success' ? props.labels.success(state.result) : '';

  useEffect(
    () => () => {
      attempt.current?.abort();
    },
    [],
  );
  useEffect(() => {
    const was = previous.current;
    previous.current = state.status;
    if (state.status === 'error' && (was === 'submitting' || (was === 'error' && lastError.current !== errorText)))
      announce(errorText, 'assertive');
    lastError.current = errorText;
    if (state.status !== 'success' || was !== 'submitting') return;
    const controller = attempt.current;
    announce(successText);
    if (!controlled && controller) {
      // The page-level region commits before a closing callback can unmount the wizard.
      requestAnimationFrame(() => {
        if (!controller.signal.aborted && attempt.current === controller) complete(state.result);
      });
    }
  }, [state, successText, errorText, announce, controlled]);

  const finish = async (values: V) => {
    if (state.status === 'submitting' || state.status === 'success') return;
    attempt.current?.abort();
    const controller = new AbortController();
    attempt.current = controller;
    if (!controlled) {
      previous.current = 'submitting';
      setInternal({ status: 'submitting' });
    }
    try {
      const result = await props.onFinish(values, { signal: controller.signal });
      if (!controlled && !controller.signal.aborted) setInternal({ status: 'success', result });
    } catch (error: unknown) {
      if (!controlled && !controller.signal.aborted) setInternal({ status: 'error', error });
    }
  };
  const reset = () => {
    attempt.current?.abort();
    attempt.current = null;
    previous.current = 'idle';
    if (!controlled) setInternal({ status: 'idle' });
  };
  return { state, finish, reset, successText, errorText };
}
