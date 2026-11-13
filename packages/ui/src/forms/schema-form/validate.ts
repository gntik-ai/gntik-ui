import type { I18n } from '../../i18n';
import type { SchemaIssue } from '../schemaResolver';
import { isRecord, resolveRef, schemaType, unsupportedKeyword } from './resolve-ref';
import { prepareValues } from './values';
import type { JsonSchema } from './types';

function equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => equal(v, b[i]));
  if (isRecord(a) && isRecord(b))
    return (
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every((k) => Object.hasOwn(b, k) && equal(a[k], b[k]))
    );
  return false;
}
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
/** Validates raw widget values. Issues use the same nested paths as schemaResolver. */
export function validate(
  schema: JsonSchema,
  input: unknown,
  t: I18n['t'],
  root = schema,
  path: (string | number)[] = [],
  required = false,
  depth = 0,
): SchemaIssue[] {
  if (depth > 32) return [{ path, code: 'json', message: t('schemaForm.json') }];
  schema = resolveRef(schema, root);
  const issue = (code: string, message: string): SchemaIssue[] => [{ path, code, message }];
  const empty = input === undefined || input === null || input === '';
  if (empty && required) return issue('required', t('schemaForm.required'));
  if (empty && schemaType(schema) !== 'object' && !Array.isArray(input) && typeof path.at(-1) !== 'number') {
    if (schema.minItems && schema.minItems > 0)
      return issue('minItems', t('schemaForm.minItems', { count: schema.minItems }));
    return [];
  }
  if (unsupportedKeyword(schema)) {
    if (typeof input === 'string') {
      try {
        JSON.parse(input);
      } catch {
        return issue('json', t('schemaForm.json'));
      }
    }
    return [];
  }
  const value = prepareValues(schema, input, root);
  const type = schemaType(schema);
  const validType =
    type === undefined ||
    (type === 'object'
      ? isRecord(value)
      : type === 'array'
        ? Array.isArray(value)
        : type === 'null'
          ? value === null
          : type === 'integer'
            ? typeof value === 'number' && Number.isInteger(value)
            : type === 'number'
              ? typeof value === 'number' && Number.isFinite(value)
              : typeof value === type);
  if (!validType) return issue('type', t('schemaForm.type', { type: t(`schemaForm.${type ?? 'string'}`) }));
  if (
    (schema.enum && !schema.enum.some((v) => equal(v, value))) ||
    (Object.hasOwn(schema, 'const') && !equal(schema.const, value)) ||
    (schema.oneOf && !schema.oneOf.some((s) => equal(s.const, value)))
  )
    return issue('enum', t('schemaForm.enum'));
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum)
      return issue('minimum', t('schemaForm.minimum', { min: schema.minimum }));
    if (schema.maximum !== undefined && value > schema.maximum)
      return issue('maximum', t('schemaForm.maximum', { max: schema.maximum }));
    if (schema.multipleOf && Math.abs(value / schema.multipleOf - Math.round(value / schema.multipleOf)) > 1e-9)
      return issue('multipleOf', t('schemaForm.multipleOf', { step: schema.multipleOf }));
  }
  if (typeof value === 'string') {
    const cap = schema.maxLength ?? (schema.pattern ? 1000 : undefined);
    if (cap !== undefined && value.length > cap) return issue('maxLength', t('schemaForm.maxLength', { max: cap }));
    if (schema.minLength !== undefined && value.length < schema.minLength)
      return issue('minLength', t('schemaForm.minLength', { min: schema.minLength }));
    if (schema.pattern) {
      try {
        if (!new RegExp(schema.pattern).test(value)) return issue('pattern', t('schemaForm.pattern'));
      } catch {
        return issue('pattern', t('schemaForm.pattern'));
      }
    }
    if (schema.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return issue('email', t('schemaForm.email'));
    if (schema.format === 'uri') {
      try {
        new URL(value);
      } catch {
        return issue('uri', t('schemaForm.uri'));
      }
    }
    if (schema.format === 'date' && !validDate(value)) return issue('date', t('schemaForm.date'));
    if (
      schema.format === 'date-time' &&
      (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value) ||
        !validDate(value.slice(0, 10)) ||
        Number.isNaN(Date.parse(value)))
    )
      return issue('date', t('schemaForm.date'));
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems)
      return issue('minItems', t('schemaForm.minItems', { count: schema.minItems }));
    if (schema.maxItems !== undefined && value.length > schema.maxItems)
      return issue('maxItems', t('schemaForm.maxItems', { count: schema.maxItems }));
    if (schema.uniqueItems && value.some((v, i) => value.slice(0, i).some((other) => equal(v, other))))
      return issue('uniqueItems', t('schemaForm.uniqueItems'));
    // Use raw entries so invalid JSON strings are not mistaken for parsed values.
    const raw = Array.isArray(input) ? input : value;
    return schema.items
      ? raw.flatMap((v, i) => validate(schema.items!, v, t, root, [...path, i], false, depth + 1))
      : [];
  }
  if (type === 'object' && isRecord(value)) {
    const raw = isRecord(input) ? input : value;
    return Object.entries(schema.properties ?? {}).flatMap(([key, child]) =>
      validate(child, raw[key] ?? child.default, t, root, [...path, key], schema.required?.includes(key), depth + 1),
    );
  }
  return [];
}
