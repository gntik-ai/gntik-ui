import { isRecord, resolveRef, schemaType, unsupportedKeyword } from './resolve-ref';
import type { JsonSchema } from './types';

/** Raw widget defaults; differs from submitted values because empty controls must stay mounted. */
export function initialValue(schema: JsonSchema, value?: unknown, root = schema, depth = 0): unknown {
  if (depth > 32) return value;
  schema = resolveRef(schema, root);
  const next = value === undefined ? schema.default : value;
  if (unsupportedKeyword(schema)) return next === undefined ? '' : JSON.stringify(next, null, 2);
  if (schemaType(schema) === 'object') {
    const input = isRecord(next) ? next : {};
    return Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([key, child]) => [
        key,
        initialValue(child, input[key], root, depth + 1),
      ]),
    );
  }
  if (schemaType(schema) === 'array')
    return Array.isArray(next)
      ? next.map((v) => (schema.items ? initialValue(schema.items, v, root, depth + 1) : v))
      : [];
  return (
    next ?? (schema.type === 'boolean' ? false : schema.type === 'number' || schema.type === 'integer' ? null : '')
  );
}
/** Parses JSON fallback fields, applies defaults and omits only empty optional values. */
export function prepareValues(schema: JsonSchema, value: unknown, root = schema, depth = 0): unknown {
  if (depth > 32) return value;
  schema = resolveRef(schema, root);
  if (value === undefined && schema.default !== undefined) value = schema.default;
  if (unsupportedKeyword(schema)) {
    if (typeof value !== 'string' || value === '') return value;
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  if (schemaType(schema) === 'object' && (value === undefined || isRecord(value))) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(schema.properties ?? {})) {
      const next = prepareValues(child, value?.[key], root, depth + 1);
      if (
        !schema.required?.includes(key) &&
        (next === '' || next === undefined || next === null || (Array.isArray(next) && next.length === 0))
      )
        continue;
      Object.defineProperty(result, key, { value: next, enumerable: true, writable: true, configurable: true });
    }
    return result;
  }
  if (Array.isArray(value) && schema.items) return value.map((v) => prepareValues(schema.items!, v, root, depth + 1));
  if ((schema.type === 'number' || schema.type === 'integer') && typeof value === 'string' && value.trim() !== '')
    return Number(value);
  return value;
}
