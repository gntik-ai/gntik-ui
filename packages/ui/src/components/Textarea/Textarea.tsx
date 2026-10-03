import { Field } from '@base-ui/react/field';
import { mergeProps } from '@base-ui/react/merge-props';
import type { ComponentProps, Ref } from 'react';
import { cn } from '../../utils/cn';
import { textareaVariants, type TextareaVariantProps } from './textarea.variants';

type NativeTextareaProps = Omit<ComponentProps<'textarea'>, 'className' | 'ref' | 'value' | 'defaultValue' | 'onChange'>;

export interface TextareaProps extends NativeTextareaProps, TextareaVariantProps {
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
  ...rest
}: TextareaProps) {
  return (
    <Field.Control
      ref={ref as Ref<HTMLElement> | undefined}
      id={id}
      name={name}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (v) => onValueChange(v) : undefined}
      render={(controlProps) => (
        <textarea
          {...mergeProps<'textarea'>(controlProps as ComponentProps<'textarea'>, rest, {
            rows: autosize ? undefined : rows,
            'aria-invalid': invalid || undefined,
            className: cn(textareaVariants({ size, resize, autosize }), className),
          })}
        />
      )}
    />
  );
}
