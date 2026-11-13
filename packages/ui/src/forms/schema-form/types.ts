import type { ComponentType, ReactNode } from 'react';
import type { Control, ControllerFieldState, FieldValues, Resolver } from 'react-hook-form';
import type { BindingControlProps } from '../bindings';

/** Supported JSON Schema subset. Extra keywords remain unknown and trigger a visible JSON fallback. */
export interface JsonSchema {
  readonly [keyword: string]: unknown;
  type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
  title?: string;
  description?: string;
  default?: unknown;
  properties?: Readonly<Record<string, JsonSchema>>;
  required?: readonly string[];
  items?: JsonSchema;
  enum?: readonly unknown[];
  const?: unknown;
  oneOf?: readonly JsonSchema[];
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  writeOnly?: boolean;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  $ref?: string;
  $defs?: Readonly<Record<string, JsonSchema>>;
}
export type SchemaValues = Record<string, unknown>;
export interface SchemaUiField {
  widget?: string;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  hidden?: boolean;
  order?: number;
}
export type SchemaWidget = ComponentType<{
  name: string;
  schema: JsonSchema;
  controlProps: BindingControlProps<unknown>;
  fieldState: ControllerFieldState;
}>;
export interface SchemaFieldsProps<TValues extends FieldValues = SchemaValues> {
  /** An object schema; only local #/$defs references are resolved. */
  schema: JsonSchema;
  control?: Control<TValues>;
  ui?: Record<string, SchemaUiField>;
  widgets?: Record<string, SchemaWidget>;
  columns?: 1 | 2;
  disabled?: boolean;
}
export interface SchemaFormProps extends Omit<SchemaFieldsProps, 'control'> {
  defaultValues?: SchemaValues;
  onSubmit: (values: SchemaValues) => void | Promise<void>;
  onChange?: (values: SchemaValues) => void;
  /** Fully replaces built-in validation and transformation. */
  resolver?: Resolver<SchemaValues, unknown, SchemaValues>;
  submitLabel?: ReactNode;
}
