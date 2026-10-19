import { safeUrl } from '../Markdown/Markdown';
import { getPointer } from './pointer';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function bindingPath(value: unknown): string | undefined {
  if (!isRecord(value) || !Object.hasOwn(value, 'path')) return undefined;
  if (typeof value.path !== 'string' || Object.keys(value).length !== 1) throw new Error('Invalid binding');
  // Validate even when the model has no value at this path yet.
  getPointer({}, value.path);
  return value.path;
}

export function resolveValue(value: unknown, model: unknown): unknown {
  const path = bindingPath(value);
  if (path !== undefined) return getPointer(model, path);
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, model));
  if (isRecord(value))
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveValue(item, model)]));
  return value;
}

/** Remove executable/structural properties before even a host validator sees agent input. */
export function safeProperties(input: Readonly<Record<string, unknown>>, model: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (
      /^on/i.test(key) ||
      [
        'id',
        'component',
        'children',
        'className',
        'style',
        'dangerouslySetInnerHTML',
        'ref',
        'key',
        'render',
        'as',
        '__proto__',
        'constructor',
        'prototype',
      ].includes(key)
    )
      continue;
    const resolved = resolveValue(value, model);
    result[key] =
      /(?:href|src|url)$/i.test(key) && typeof resolved === 'string' ? safeUrl(resolved) || undefined : resolved;
  }
  return result;
}

export function validAction(value: unknown): boolean {
  return (
    value === undefined ||
    (isRecord(value) &&
      typeof value.name === 'string' &&
      value.name.trim().length > 0 &&
      value.name.length <= 128 &&
      (value.context === undefined || isRecord(value.context)))
  );
}
