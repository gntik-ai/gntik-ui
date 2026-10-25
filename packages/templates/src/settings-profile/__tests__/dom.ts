import { withoutForcedColors } from '../../test/without-forced-colors';

/** Preserve normal-colour markup, canonicalizing only generated IDs and media-scoped classes. */
export function profileDOM(container: HTMLElement): string {
  const ids = new Map<string, string>();
  return withoutForcedColors(container).innerHTML.replace(/_r_[a-z0-9]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `_r_${ids.size}_`);
    return ids.get(id)!;
  });
}
