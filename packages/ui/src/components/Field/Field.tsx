import { Field as BaseField } from '@base-ui/react/field';
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import { CircleAlert } from 'lucide-react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { fieldVariants } from './field.variants';

const s = fieldVariants();

export interface FieldProps extends Omit<BaseField.Root.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Groups a label, a control, a description and an error. Base UI wires the ids: the label
 * targets the control, and the description and error are linked with aria-describedby.
 * Pass `invalid` to drive the error from outside (e.g. a form library).
 */
export function Field({ className, ...props }: FieldProps) {
  return <BaseField.Root className={cn(s.root(), className)} {...props} />;
}

export interface FieldLabelProps extends Omit<BaseField.Label.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLLabelElement>;
  /** Shows a required marker after the label text (also set `required` on the control). */
  required?: boolean;
}

/** Visible label; clicking it focuses the field's control. */
export function FieldLabel({ className, required, children, ...props }: FieldLabelProps) {
  return (
    <BaseField.Label className={cn(s.label(), className)} {...props}>
      {children}
      {required && (
        <span aria-hidden className={s.required()}>
          *
        </span>
      )}
    </BaseField.Label>
  );
}

export interface FieldDescriptionProps extends Omit<BaseField.Description.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLParagraphElement>;
}

/** Helper text under the control, announced as part of its description. */
export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return <BaseField.Description className={cn(s.description(), className)} {...props} />;
}

export interface FieldErrorProps extends Omit<BaseField.Error.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Hide the leading alert icon. */
  hideIcon?: boolean;
}

/**
 * Validation message. Rendered only while the field is invalid (or when `match` says so)
 * and linked to the control through aria-describedby.
 */
export function FieldError({ className, hideIcon, children, ...props }: FieldErrorProps) {
  return (
    <BaseField.Error className={cn(s.error(), className)} {...props}>
      {!hideIcon && <CircleAlert size={13} aria-hidden className="mt-[3px] shrink-0" />}
      <span>{children}</span>
    </BaseField.Error>
  );
}

export interface FieldItemProps extends Omit<BaseField.Item.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Wraps one checkbox or radio inside a group that lives in a Field. */
export function FieldItem({ className, ...props }: FieldItemProps) {
  return <BaseField.Item className={cn(s.item(), className)} {...props} />;
}

export interface FieldsetProps extends Omit<BaseFieldset.Root.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLFieldSetElement>;
}

/** Groups related fields (or a checkbox/radio group) under a shared legend. */
export function Fieldset({ className, ...props }: FieldsetProps) {
  return <BaseFieldset.Root className={cn(s.fieldset(), className)} {...props} />;
}

export interface FieldsetLegendProps extends Omit<BaseFieldset.Legend.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** The fieldset's accessible name. */
export function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return <BaseFieldset.Legend className={cn(s.legend(), className)} {...props} />;
}

/** Supporting text under a legend. */
export function FieldsetDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }) {
  return <p className={cn(s.legendDescription(), className)} {...props} />;
}
