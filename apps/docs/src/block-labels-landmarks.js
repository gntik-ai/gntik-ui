// This standalone fixture supplies page landmarks for body portals, just as it supplies
// <main> for inline blocks. Only the otherwise unsemantic portal host is labelled;
// popup roles, names, focus guards and descendants remain the kit's own output.
export function installFixtureLandmarks(document) {
  const fixtureHosts = new WeakSet();
  const update = () => {
    for (const portal of document.querySelectorAll('body > [data-base-ui-portal]')) {
      if (!fixtureHosts.has(portal)) {
        // Preserve kit semantics if a release ever supplies its own host role or name.
        if (['role', 'aria-label', 'aria-labelledby'].some((attribute) => portal.hasAttribute(attribute))) continue;
        fixtureHosts.add(portal);
      }
      const exposed = [...portal.children].some(
        (child) => !child.hidden && child.getAttribute('aria-hidden') !== 'true',
      );
      if (exposed) {
        portal.setAttribute('role', 'region');
        portal.setAttribute('aria-label', 'Items');
      } else {
        portal.removeAttribute('role');
        portal.removeAttribute('aria-label');
      }
    }
  };
  const observer = new document.defaultView.MutationObserver(update);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'aria-hidden'],
  });
  update();
  return () => observer.disconnect();
}
