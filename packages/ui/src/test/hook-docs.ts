import type { HookDoc } from '../doc';

/** Names exported like hooks: `use` followed by an upper-case letter. */
export const isHookName = (name: string) => /^use[A-Z]/.test(name);

/** Hook names a set of docs covers: each doc's `name` plus its `also` list. */
export function documentedHooks(docs: readonly HookDoc[]): Set<string> {
  return new Set(docs.flatMap((doc) => [doc.name, ...(doc.also ?? [])]));
}

/** Hooks among `exportNames` that no doc covers, sorted. */
export function undocumentedHooks(exportNames: readonly string[], docs: readonly HookDoc[]): string[] {
  const covered = documentedHooks(docs);
  return exportNames.filter((name) => isHookName(name) && !covered.has(name)).sort();
}
