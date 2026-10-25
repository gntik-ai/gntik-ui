import { withoutForcedColors } from '../../test/without-forced-colors';

/** Ignore forced-colour classes and React's per-root IDs, preserving all other DOM. */
export function profileDOM(container: HTMLElement): string {
  const ids = new Map<string, string>();
  return withoutForcedColors(container).innerHTML.replace(/_r_[a-z0-9]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `_r_${ids.size}_`);
    return ids.get(id)!;
  });
}
