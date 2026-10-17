/** Programmatic focus permits negative tabIndex, but never hidden, inert or disabled targets. */
export function usableFocusTarget(element: Element | null | undefined): element is HTMLElement {
  if (!(element instanceof HTMLElement) || !element.isConnected || element === document.body) return false;
  if (element.matches(':disabled, [disabled], [aria-disabled="true"], input[type="hidden"]')) return false;
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hidden || ancestor.hasAttribute('inert') || ancestor.getAttribute('aria-disabled') === 'true')
      return false;
    const style = getComputedStyle(ancestor);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse' ||
      style.contentVisibility === 'hidden'
    )
      return false;
  }
  return element.tabIndex >= 0 || element.hasAttribute('tabindex') || element.isContentEditable;
}
