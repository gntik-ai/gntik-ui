import { Field } from '@base-ui/react/field';
import { mergeProps } from '@base-ui/react/merge-props';
import { useState, type ComponentProps, type CSSProperties, type Ref } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { ClearControlButton, resetNativeValue, type ClearableProps } from '../../utils/clear-control';
import { useFieldVariant } from '../../field-variant/field-variant-context';
import { useAutosizeFallback } from './useAutosizeFallback';
import { cn } from '../../utils/cn';
import { CharCount, useCharCount, type CharCountProps } from '../../utils/char-count';
import { textareaAutosizeBounds, textareaVariants, type TextareaVariantProps } from './textarea.variants';

type NativeTextareaProps = Omit<
  ComponentProps<'textarea'>,
  'className' | 'ref' | 'value' | 'defaultValue' | 'onChange'
>;

export interface TextareaProps extends NativeTextareaProps, TextareaVariantProps, ClearableProps, CharCountProps {
  /** Minimum content rows with autosize; otherwise ignored. Positive finite values only. */
  minRows?: number;
  /** Maximum content rows with autosize; overflow scrolls. Positive finite values only. */
  maxRows?: number;
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
 * `autosize` grows the box with its content via native `field-sizing: content`, with a measured fallback.
 */
export function Textarea({
  size = 'auto',
  variant,
  resize,
  autosize,
  minRows,
  maxRows,
  style,
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
  showCount,
  maxCount,
  countStrategy,
  ...rest
}: TextareaProps) {
  const maximum = autosize && maxRows !== undefined && Number.isFinite(maxRows) && maxRows > 0 ? maxRows : undefined;
  const minimum =
    autosize && minRows !== undefined && Number.isFinite(minRows) && minRows > 0
      ? Math.min(minRows, maximum ?? Infinity)
      : undefined;
  const boundedStyle = {
    ...style,
    ...(minimum !== undefined && { '--textarea-min-rows': minimum }),
    ...(maximum !== undefined && { '--textarea-max-rows': maximum }),
  } as CSSProperties;
  const fieldVariant = useFieldVariant(variant);
  const [control, setControl] = useState<HTMLTextAreaElement | null>(null);
  const [inner, setInner] = useState(defaultValue ?? '');
  const counter = useCharCount(value ?? inner, { showCount, maxCount, countStrategy }, rest.maxLength);
  useAutosizeFallback(control, autosize, value ?? inner, minimum, maximum, size);
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
              style: minimum !== undefined || maximum !== undefined ? boundedStyle : style,
              'aria-invalid': invalid || undefined,
              ...(showCount && {
                'aria-describedby': [controlProps['aria-describedby'], rest['aria-describedby'], counter.descriptionId]
                  .filter(Boolean)
                  .join(' '),
                'data-over-limit': counter.over ? '' : undefined,
              }),
              className: cn(
                textareaVariants({ variant: fieldVariant, size, resize, autosize }),
                minimum !== undefined && textareaAutosizeBounds.min,
                maximum !== undefined && textareaAutosizeBounds.max,
                clearable && 'pe-9',
                className,
              ),
            })}
          />
        )}
      />
    ),
  });
  const field = !clearable ? (
    textarea
  ) : (
    <div className="relative">
      {textarea}
      {hasValue && !disabled && !rest.readOnly && (
        <ClearControlButton
          className="absolute top-2 end-2 min-h-6 min-w-6"
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
  if (!showCount) return field;
  return (
    <div className="flex flex-col gap-1">
      {field}
      <div className="flex justify-end">
        <CharCount {...counter} />
      </div>
    </div>
  );
}
