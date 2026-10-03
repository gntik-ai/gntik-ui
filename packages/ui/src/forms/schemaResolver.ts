import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';

/** One validation issue, as zod (v3 and v4) and other Standard-Schema-style libraries report it. */
export interface SchemaIssue {
  path: ReadonlyArray<PropertyKey | { key: PropertyKey }>;
  message: string;
  code?: string;
}

type SafeParseResult<Out> = { success: true; data: Out } | { success: false; error: { issues: readonly SchemaIssue[] } };

/** Anything with zod's `safeParseAsync` / `safeParse` shape (a zod schema, or an adapter). */
export interface ParseableSchema<Out> {
  safeParseAsync?: (values: unknown) => Promise<SafeParseResult<Out>>;
  safeParse?: (values: unknown) => SafeParseResult<Out>;
}

function setPath(target: Record<string, unknown>, path: readonly string[], value: unknown) {
  let node = target;
  path.forEach((key, i) => {
    if (i === path.length - 1) {
      if (node[key] === undefined) node[key] = value; // first issue per field wins
      return;
    }
    const next = node[key];
    node[key] = next && typeof next === 'object' ? next : {};
    node = node[key] as Record<string, unknown>;
  });
}

/** Converts schema issues into react-hook-form's nested `errors` object. */
export function issuesToErrors<TValues extends FieldValues>(issues: readonly SchemaIssue[]): FieldErrors<TValues> {
  const errors: Record<string, unknown> = {};
  for (const issue of issues) {
    const path = issue.path.map((p) => String(typeof p === 'object' && p !== null ? p.key : p));
    setPath(errors, path.length ? path : ['root'], { type: issue.code ?? 'validate', message: issue.message });
  }
  return errors as FieldErrors<TValues>;
}

/**
 * A `zodResolver`-compatible resolver with no extra dependency: `useForm({ resolver: schemaResolver(schema) })`.
 * Accepts a zod 3/4 schema (or any object with `safeParseAsync` / `safeParse`). On success the
 * parsed (transformed) data reaches `onSubmit`. `@hookform/resolvers/zod` works the same way with `FormField`.
 */
export function schemaResolver<TValues extends FieldValues, TOutput = TValues>(
  schema: ParseableSchema<TOutput>,
): Resolver<TValues, unknown, TOutput> {
  return async (values) => {
    const result = schema.safeParseAsync ? await schema.safeParseAsync(values) : schema.safeParse?.(values);
    if (!result) throw new Error('schemaResolver: the schema has neither safeParseAsync nor safeParse');
    if (result.success) return { values: result.data, errors: {} };
    return { values: {}, errors: issuesToErrors<TValues>(result.error.issues) };
  };
}
