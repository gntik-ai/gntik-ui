import axe from 'axe-core';

/**
 * Runs axe on a container and returns the violations. Colour contrast is checked in the
 * browser suite (jsdom has no layout or computed colours), so it is disabled here.
 */
export async function axeViolations(container: Element = document.body) {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
}

/** Asserts that a container has no axe violations. */
export async function expectNoAxeViolations(container: Element = document.body) {
  const violations = await axeViolations(container);
  if (violations.length) throw new Error('axe violations:\n' + violations.join('\n'));
}
