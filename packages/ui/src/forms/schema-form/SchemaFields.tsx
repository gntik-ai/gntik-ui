import { useEffect, useRef } from 'react';
import { useController, useFormContext, useWatch, get, type Control, type FieldValues } from 'react-hook-form';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Fieldset,
  FieldsetLegend,
  FieldsetDescription,
} from '../../components/Field';
import { useI18n } from '../../i18n';
import { FieldArray } from '../FieldArray';
import { resolveFocusTarget } from '../bindings';
import { issuesToErrors } from '../schemaResolver';
import { initialValue } from './values';
import { validate } from './validate';
import { resolveRef, schemaType, unsupportedKeyword, isRecord } from './resolve-ref';
import { DefaultWidget } from './widgets';
import { schemaFormVariants } from './schema-form.variants';
import type { JsonSchema, SchemaFieldsProps, SchemaValues } from './types';

/** Fields for an existing react-hook-form control or FormProvider. Resolver validation takes precedence over field rules. */
export function SchemaFields<TValues extends FieldValues = SchemaValues>({
  schema,
  control: controlProp,
  columns = 1,
  ...props
}: SchemaFieldsProps<TValues>) {
  const context = useFormContext<TValues>();
  // Schema paths are dynamic; preserve the caller's typed control at the public boundary.
  const control = (controlProp ?? context?.control) as unknown as Control<SchemaValues> | undefined;
  return (
    <SchemaChildren
      {...props}
      columns={columns}
      control={control}
      root={schema}
      schema={schema}
      name=""
      initial={initialValue(schema)}
    />
  );
}
interface NodeProps extends Omit<SchemaFieldsProps, 'schema'> {
  root: JsonSchema;
  schema: JsonSchema;
  name: string;
  required?: boolean;
  depth?: number;
  initial?: unknown;
}
function SchemaChildren(props: NodeProps) {
  const { schema, name, columns, root } = props;
  const s = schemaFormVariants({ columns });
  return (
    <div className={s.fields()}>
      {Object.entries(schema.properties ?? {})
        .sort(
          ([a], [b]) =>
            (props.ui?.[name ? `${name}.${a}` : a]?.order ?? Infinity) -
            (props.ui?.[name ? `${name}.${b}` : b]?.order ?? Infinity),
        )
        .map(([key, child]) => (
          <SchemaNode
            key={key}
            {...props}
            name={name ? `${name}.${key}` : key}
            schema={resolveRef(child, root)}
            required={schema.required?.includes(key)}
            initial={get(props.initial, key)}
            depth={(props.depth ?? 0) + 1}
          />
        ))}
    </div>
  );
}
function SchemaNode(props: NodeProps) {
  const { schema, name, ui, depth = 0 } = props;
  if (ui?.[name]?.hidden) return null;
  if (!ui?.[name]?.widget && !schema.enum && !schema.oneOf && !unsupportedKeyword(schema) && depth < 32) {
    if (schemaType(schema) === 'object') return <SchemaObject {...props} />;
    if (schemaType(schema) === 'array' && schema.items && schemaType(resolveRef(schema.items, props.root)) === 'object')
      return <SchemaArray {...props} />;
  }
  return <SchemaLeaf {...props} />;
}
function presentation({ schema, name, ui }: NodeProps) {
  const config = ui?.[name];
  return {
    label: config?.label ?? schema.title ?? humanize(name.split('.').at(-1) ?? name),
    description: config?.description ?? schema.description,
  };
}
function SchemaObject(props: NodeProps) {
  const { label, description } = presentation(props);
  const s = schemaFormVariants();
  return (
    <Fieldset className={s.wide()} disabled={props.disabled}>
      <FieldsetLegend>{label}</FieldsetLegend>
      {description && <FieldsetDescription>{description}</FieldsetDescription>}
      <SchemaChildren {...props} />
    </Fieldset>
  );
}
type ArrayValues = Record<string, SchemaValues[]>;
function SchemaArray(props: NodeProps) {
  const { schema, root, name, control } = props;
  const { label, description } = presentation(props);
  const { t } = useI18n();
  const items = resolveRef(schema.items!, root);
  const current = useWatch({ control, name });
  const { field } = useController<SchemaValues>({
    name,
    control,
    defaultValue: props.initial ?? initialValue(schema, undefined, root),
  });
  const { onChange } = field;
  useEffect(() => {
    if (current === undefined) onChange(props.initial ?? initialValue(schema, undefined, root));
  }, [current, onChange, props.initial, schema, root]);
  return (
    <fieldset
      disabled={props.disabled}
      className={schemaFormVariants().wide()}
      ref={(element) =>
        field.ref(
          element
            ? {
                focus: () => {
                  const invalid = element.querySelector<HTMLElement>('[aria-invalid="true"]');
                  const target = (invalid ? resolveFocusTarget(invalid) : null) ?? resolveFocusTarget(element);
                  target?.focus();
                },
              }
            : null,
        )
      }
    >
      {current !== undefined && (
        <FieldArray<ArrayValues>
          name={name}
          control={control as unknown as Control<ArrayValues>}
          label={label}
          description={description}
          min={schema.minItems}
          max={schema.maxItems}
          defaultItem={() => initialValue(items, undefined, root) as SchemaValues}
          rules={{
            validate: (value) => {
              const errors = issuesToErrors<SchemaValues>(validate(schema, value, t, root));
              return (get(errors, 'root') as { message?: string } | undefined)?.message ?? true;
            },
          }}
        >
          {(row) => (
            <SchemaChildren
              {...props}
              schema={items}
              name={`${name}.${row.index}`}
              initial={get(field.value, String(row.index))}
            />
          )}
        </FieldArray>
      )}
    </fieldset>
  );
}
function SchemaLeaf(props: NodeProps) {
  const { schema, root, name, control, required, ui, widgets, disabled } = props;
  const { t } = useI18n();
  const { field, fieldState } = useController<SchemaValues>({
    name,
    control,
    disabled,
    defaultValue: props.initial ?? initialValue(schema, undefined, root),
    rules: {
      validate: (value) => {
        const errors = issuesToErrors<SchemaValues>(validate(schema, value, t, root, [], required));
        return firstMessage(errors) ?? true;
      },
    },
  });
  const error = firstMessage(fieldState.error);
  const config = ui?.[name];
  const keyword = unsupportedKeyword(schema) ?? ((props.depth ?? 0) >= 32 ? '$ref' : undefined);
  const warned = useRef(new Set<string>());
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && keyword && !warned.current.has(keyword)) {
      warned.current.add(keyword);
      console.warn(`SchemaForm: unsupported keyword ${keyword} at ${name}; using JSON textarea.`);
    }
  }, [keyword, name]);
  const { label, description } = presentation(props);
  const controlProps = { ...field, 'aria-invalid': fieldState.invalid || undefined };
  const Widget = config?.widget ? widgets?.[config.widget] : undefined;
  return (
    <Field
      name={name}
      invalid={fieldState.invalid}
      dirty={fieldState.isDirty}
      touched={fieldState.isTouched}
      disabled={disabled}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      {Widget ? (
        <Widget name={name} schema={schema} controlProps={controlProps} fieldState={fieldState} />
      ) : (
        <DefaultWidget
          schema={schema}
          controlProps={controlProps}
          label={typeof label === 'string' ? label : humanize(name)}
          placeholder={config?.placeholder}
          json={!!keyword}
        />
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError match={!!error}>{error}</FieldError>
    </Field>
  );
}
function humanize(key: string) {
  const value = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ');
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Composite controls show their first nested item message without changing RHF's mapped error paths. */
function firstMessage(error: unknown): string | undefined {
  if (Array.isArray(error)) return error.map(firstMessage).find(Boolean);
  if (!isRecord(error)) return undefined;
  if (typeof error.message === 'string') return error.message;
  for (const [key, child] of Object.entries(error)) {
    if (key === 'ref' || key === 'type') continue;
    const message = firstMessage(child);
    if (message) return message;
  }
  return undefined;
}
