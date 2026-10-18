import type { RefCallback } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

/** The public control props returned by useFieldProps. */
export interface BindingControlProps<TValue> {
  name: string;
  value: TValue;
  onChange: ControllerRenderProps['onChange'];
  onBlur: () => void;
  ref: ControllerRenderProps['ref'];
  disabled?: boolean;
  readOnly?: boolean;
  'aria-invalid'?: true;
}

export interface ValueBindingProps<TValue> {
  name: string;
  value: NonNullable<TValue> | null;
  onValueChange: (value: TValue | null) => void;
  ref: RefCallback<HTMLElement>;
  disabled?: boolean;
  readOnly?: boolean;
  'aria-invalid'?: true;
}

export interface CheckedBindingProps extends Omit<ValueBindingProps<boolean>, 'value' | 'onValueChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** Maps value/onChange controls to the kit's value/onValueChange API. Changes also touch the field. */
export function toValueProps<TValue>({
  value,
  onChange,
  onBlur,
  ...props
}: BindingControlProps<TValue>): ValueBindingProps<TValue> {
  return {
    ...props,
    ref: focusTargetRef(props.ref),
    value: value ?? null,
    onValueChange: (next) => {
      onChange(next);
      onBlur();
    },
  };
}

/** Maps value/onChange controls to the kit's checked/onCheckedChange API. */
export function toCheckedProps<TValue>({
  value,
  onChange,
  onBlur,
  ...props
}: BindingControlProps<TValue>): CheckedBindingProps {
  return {
    ...props,
    ref: focusTargetRef(props.ref),
    checked: !!value,
    onCheckedChange: (next) => {
      onChange(next);
      onBlur();
    },
  };
}

/** Resolve at focus time: composite controls can mount or change their tabbable child later. */
export function resolveFocusTarget(element: HTMLElement): HTMLElement | null {
  const enabled = ':not(:disabled):not([aria-disabled="true"])';
  if (
    element.matches(
      `input:not([type="hidden"])${enabled}, button${enabled}, textarea${enabled}, select${enabled}, a[href], [tabindex]${enabled}`,
    )
  )
    return element;
  return (
    element.querySelector<HTMLElement>(`[tabindex="0"]${enabled}`) ??
    element.querySelector<HTMLElement>(`input:not([type="hidden"])${enabled}, button${enabled}`)
  );
}

function focusTargetRef(ref: BindingControlProps<unknown>['ref']): RefCallback<HTMLElement> {
  return (element) => ref(element ? { focus: () => resolveFocusTarget(element)?.focus() } : null);
}
