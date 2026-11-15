import { createContext, useCallback, useContext, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Field as BaseField } from '@base-ui/react/field';
import { useRender } from '@base-ui/react/use-render';
import { useI18n } from '../../i18n/I18nProvider';
import { fieldVariants } from './field.variants';

export type FieldStatus = 'idle' | 'validating' | 'warning' | 'success';
export interface FieldStatusState {
  status: FieldStatus | 'error';
  invalid: boolean;
  validating: boolean;
}
interface StatusContext extends FieldStatusState {
  feedbackIcon: boolean;
  statusEnabled?: boolean;
  registerMessage?: (tone: 'error' | 'warning' | 'success', node: HTMLElement | null) => void;
}
export const FieldStatusContext = createContext<StatusContext>({
  status: 'idle',
  invalid: false,
  validating: false,
  feedbackIcon: false,
});

/** Effective status of the nearest Field; outside a Field the status is idle. */
export function useFieldStatus(): FieldStatusState {
  const { status, invalid, validating } = useContext(FieldStatusContext);
  return { status, invalid, validating };
}

// Base UI owns validity, including native constraints and its validate callback. Read its
// public render state, preserving the consumer's render prop and the original root DOM.
export function FieldRootElement({
  rootProps,
  state,
  render,
  status,
  feedbackIcon,
  children,
}: {
  rootProps: HTMLAttributes<HTMLElement>;
  state: BaseField.Root.State;
  render: BaseField.Root.Props['render'];
  status: FieldStatus | undefined;
  feedbackIcon: boolean;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const effective = state.valid === false ? 'error' : (status ?? 'idle');
  const messages = useRef<Partial<Record<'error' | 'warning' | 'success', HTMLElement | null>>>({});
  const registerMessage = useCallback((tone: 'error' | 'warning' | 'success', node: HTMLElement | null) => {
    messages.current[tone] = node;
  }, []);
  const region = useRef<HTMLSpanElement>(null);
  const previous = useRef(effective);
  useEffect(() => {
    if (region.current) {
      region.current.textContent =
        effective === 'validating'
          ? t('field.validating')
          : previous.current === 'validating' &&
              (effective === 'error' || effective === 'warning' || effective === 'success')
            ? (messages.current[effective]?.textContent ?? '')
            : '';
    }
    previous.current = effective;
  }, [effective, t]);
  // Append at the existing child level: optional feedback must not remount controls.
  const content =
    status === undefined
      ? children
      : [
          ...(Array.isArray(children) ? children : [children]),
          <span
            key="field-status"
            ref={region}
            role="status"
            aria-live="polite"
            className={fieldVariants().status()}
          />,
        ];
  return useRender<BaseField.Root.State & Record<string, unknown>, HTMLElement>({
    render,
    state: { ...state },
    // BaseField already supplies all its attributes, with its own validity mapping.
    stateAttributesMapping: {
      disabled: () => null,
      touched: () => null,
      dirty: () => null,
      valid: () => null,
      filled: () => null,
      focused: () => null,
    },
    props: {
      ...rootProps,
      'data-status': status === undefined ? undefined : effective,
      children: (
        <FieldStatusContext
          value={{
            status: effective,
            invalid: effective === 'error',
            validating: effective === 'validating',
            feedbackIcon,
            statusEnabled: status !== undefined,
            registerMessage,
          }}
        >
          {content}
        </FieldStatusContext>
      ),
    },
  });
}
