import { Field } from '@base-ui/react/field';
import { mergeProps } from '@base-ui/react/merge-props';
import { useState, type ComponentProps, type Ref } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { ClearControlButton, resetNativeValue, type ClearableProps } from '../../utils/clear-control';
import { useFieldVariant } from '../../field-variant/field-variant-context';
import { cn } from '../../utils/cn';
import { textareaVariants, type TextareaVariantProps } from './textarea.variants';

type NativeTextareaProps = Omit<
  ComponentProps<'textarea'>,
  'className' | 'ref' | 'value' | 'defaultValue' | 'onChange'
>;

export interface TextareaProps extends NativeTextareaProps, TextareaVariantProps, ClearableProps {
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
  value?: string;
  defaultValue?: string;
  onChange?: ComponentProps<'textarea'>['onChange'];
  /** Called with the new string value (mirrors Input's `onValueChange`). */
  onValueChange?: (value: string) => void;
  /** Marks the value as invalid (sets aria-invalid). Inside a Field, `Field invalid` does this. */
  invalid?: boolean;
}

/**
 * Multi-line text input. Renders a native <textarea> through Base UI Field.Control, so a
 * surrounding Field links its label, description and error and tracks dirty/touched state.
 * `autosize` grows the box with its content via CSS `field-sizing: content`.
 */
export function Textarea({
  size,
  variant,
  resize,
  autosize,
  invalid,
  className,
  ref,
  id,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  rows = 4,
  clearable,
  clearLabel,
  onClear,
  ...rest
}: TextareaProps) {
  const fieldVariant = useFieldVariant(variant);
  const [control, setControl] = useState<HTMLTextAreaElement | null>(null);
  const [inner, setInner] = useState(defaultValue ?? '');
  const hasValue = (value ?? (control ? control.value : inner)).length > 0;
  const textarea = useRender({
    ref: [ref ?? null, setControl],
    render: (
      <Field.Control
        id={id}
        name={name}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(v) => {
          setInner(v);
          onValueChange?.(v);
        }}
        render={(controlProps) => (
          <textarea
            {...mergeProps<'textarea'>(controlProps as ComponentProps<'textarea'>, rest, {
              rows: autosize ? undefined : rows,
              'aria-invalid': invalid || undefined,
              className: cn(
                textareaVariants({ variant: fieldVariant, size, resize, autosize }),
                clearable && 'pe-9',
                className,
              ),
            })}
          />
        )}
      />
    ),
  });
  if (!clearable) return textarea;
  return (
    <div className="relative">
      {textarea}
      {hasValue && !disabled && !rest.readOnly && (
        <ClearControlButton
          className="absolute top-2 end-2"
          control={control}
          clearLabel={clearLabel}
          onClick={() => {
            if (!control) return;
            resetNativeValue(control);
            onClear?.();
            control.focus();
          }}
        />
      )}
    </div>
  );
}
