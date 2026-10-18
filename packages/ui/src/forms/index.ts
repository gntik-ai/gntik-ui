// @gntik-ai/ui/forms — react-hook-form adapter for the kit's Field (optional peers: react-hook-form, zod).
export {
  useFieldProps,
  type UseFieldPropsOptions,
  type UseFieldPropsResult,
  type FormFieldStateProps,
} from './useFieldProps';
export { FormField, Form, type FormFieldProps, type FormProps } from './FormField';
export { schemaResolver, issuesToErrors, type ParseableSchema, type SchemaIssue } from './schemaResolver';
export { FieldArray, type FieldArrayProps, type FieldArrayRow } from './FieldArray';
export { fieldArrayVariants } from './field-array.variants';
export { doc as fieldArrayDoc } from './FieldArray.doc';

export {
  toValueProps,
  toCheckedProps,
  type BindingControlProps,
  type ValueBindingProps,
  type CheckedBindingProps,
} from './bindings';
export type { FormFieldBinding, FormFieldWidth } from './FormField';
export type { EnhanceFieldProps, EnhancedFieldProps } from './FormField';
