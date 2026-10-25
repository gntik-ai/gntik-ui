/** Ignore only React's per-root generated IDs, preserving all references and other DOM. */
export function profileDOM(container: HTMLElement): string {
  const ids = new Map<string, string>();
  return container.innerHTML.replace(/_r_[a-z0-9]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `_r_${ids.size}_`);
    return ids.get(id)!;
  });
}
