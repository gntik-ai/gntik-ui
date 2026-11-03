import type { HookDoc } from '../doc';

/** Names exported like hooks: `use` followed by an upper-case letter. */
export const isHookName = (name: string) => /^use[A-Z]/.test(name);

/** Hook names the docs cover: each doc's own `name`. A hook never rides on another hook's doc. */
export function documentedHooks(docs: readonly HookDoc[]): Set<string> {
  return new Set(docs.map((doc) => doc.name));
}

/** Names the docs cover: each doc's `name` plus the non-hook helpers in its `also` list. */
export function documentedNames(docs: readonly HookDoc[]): Set<string> {
  return new Set(docs.flatMap((doc) => [doc.name, ...(doc.also ?? [])]));
}

/** Hooks among `exportNames` that have no doc of their own, sorted. */
export function undocumentedHooks(exportNames: readonly string[], docs: readonly HookDoc[]): string[] {
  const covered = documentedHooks(docs);
  return exportNames.filter((name) => isHookName(name) && !covered.has(name)).sort();
}

/** Exports that are neither a documented hook nor a helper a doc lists in `also`, sorted. */
export function undocumentedExports(exportNames: readonly string[], docs: readonly HookDoc[]): string[] {
  const covered = documentedNames(docs);
  return exportNames.filter((name) => !covered.has(name)).sort();
}
