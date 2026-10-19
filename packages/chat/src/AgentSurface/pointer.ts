/** RFC 6901 paths. Throws on malformed paths rather than guessing a model key. */
function segments(path: string): string[] {
  if (path === '') return [];
  if (!path.startsWith('/') || /~(?![01])/u.test(path)) throw new Error('Invalid JSON Pointer');
  const keys = path
    .slice(1)
    .split('/')
    .map((key) => key.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (keys.length > 64 || keys.some((key) => ['__proto__', 'prototype', 'constructor'].includes(key))) {
    throw new Error('Unsafe JSON Pointer');
  }
  return keys;
}

function own(value: unknown, key: string): unknown {
  return value !== null && typeof value === 'object' && Object.hasOwn(value, key)
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

export function getPointer(model: unknown, path: string): unknown {
  return segments(path).reduce<unknown>(own, model);
}

/** Copy every ancestor; never mutate the model supplied by a consumer. */
export function setPointer(model: unknown, path: string, value: unknown): unknown {
  const keys = segments(path);
  function write(current: unknown, index: number): unknown {
    if (index === keys.length) return value;
    const key = keys[index]!;
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) > current.length) throw new Error('Invalid array index');
      const copy: unknown[] = [...current];
      copy[Number(key)] = write(own(current, key), index + 1);
      return copy;
    }
    const copy: Record<string, unknown> = current && typeof current === 'object' ? { ...current } : {};
    copy[key] = write(own(current, key), index + 1);
    return copy;
  }
  return write(model, 0);
}
