/** Compare pinned ordinary-colour DOM without media-scoped forced-colour classes. */
export function withoutForcedColors(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  for (const node of [clone, ...clone.querySelectorAll('[class]')]) {
    const classes = node.getAttribute('class');
    if (classes === null) continue;
    const tokens = classes.split(/\s+/).filter(Boolean);
    const ordinary = tokens.filter((token) => !token.startsWith('forced-colors:'));
    if (ordinary.length === tokens.length) continue;
    if (ordinary.length === 0) node.removeAttribute('class');
    else node.setAttribute('class', ordinary.join(' '));
  }
  return clone;
}
