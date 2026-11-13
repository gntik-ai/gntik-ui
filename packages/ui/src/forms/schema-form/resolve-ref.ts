import type { JsonSchema } from './types';
const supported = new Set([
  'type',
  'title',
  'description',
  'default',
  'properties',
  'required',
  'items',
  'enum',
  'const',
  'oneOf',
  'minimum',
  'maximum',
  'multipleOf',
  'minLength',
  'maxLength',
  'pattern',
  'format',
  'writeOnly',
  'minItems',
  'maxItems',
  'uniqueItems',
  '$ref',
  '$defs',
  '$schema',
  '$id',
  '$comment',
  'examples',
]);
export function resolveRef(schema: JsonSchema, root: JsonSchema, seen = new Set<string>()): JsonSchema {
  if (!schema.$ref?.startsWith('#/$defs/') || seen.has(schema.$ref)) return schema;
  const ref = schema.$ref;
  seen.add(ref);
  const key = ref.slice('#/$defs/'.length).replace(/~1/g, '/').replace(/~0/g, '~');
  const target = root.$defs?.[key];
  if (!target) return schema;
  const resolved = resolveRef(target, root, seen);
  if (resolved.$ref) return schema;
  const siblings = { ...schema };
  delete siblings.$ref;
  return { ...resolved, ...siblings };
}
export function unsupportedKeyword(schema: JsonSchema): string | undefined {
  if (schema.$ref) return '$ref';
  const unknown = Object.keys(schema).find((key) => !supported.has(key));
  if (unknown) return unknown;
  if (
    schema.oneOf &&
    !schema.oneOf.every(
      (item) =>
        Object.hasOwn(item, 'const') &&
        Object.keys(item).every((key) => ['const', 'title', 'description'].includes(key)),
    )
  )
    return 'oneOf';
  if (schema.format && !['email', 'uri', 'date', 'date-time', 'password'].includes(schema.format)) return 'format';
  return undefined;
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export const schemaType = (schema: JsonSchema) =>
  schema.type ?? (schema.properties ? 'object' : schema.items ? 'array' : undefined);
