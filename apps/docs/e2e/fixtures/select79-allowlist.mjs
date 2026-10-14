/** gntik-ai/gntik-ui#79: ONLY aria-input-field-name on the exact BaseSelect.List node. */
export function selectListbox79(violations, exactListboxTarget) {
  return violations.flatMap((violation) => {
    if (violation.id !== 'aria-input-field-name' || exactListboxTarget === null) return [violation];
    const nodes = violation.nodes.filter((node) => JSON.stringify(node.target) !== JSON.stringify(exactListboxTarget));
    return nodes.length ? [{ ...violation, nodes }] : [];
  });
}
