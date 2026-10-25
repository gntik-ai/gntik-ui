/** Keep pinned normal-colour DOM fixtures while UI state adds media-scoped fallbacks. */
export function withoutForcedColors(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  for (const node of [clone, ...clone.querySelectorAll('[class]')]) {
    const classes = node.getAttribute('class');
    if (classes?.includes('forced-colors:')) {
      node.setAttribute(
        'class',
        classes
          .split(' ')
          .filter((name) => !name.startsWith('forced-colors:'))
          .join(' '),
      );
    }
  }
  return clone;
}
