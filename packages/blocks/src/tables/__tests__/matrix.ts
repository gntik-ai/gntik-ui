import axe, { type Result } from 'axe-core';
import { expect } from 'vitest';
import { getRoles, queryAllByRole } from '@testing-library/react';

import { SELECT_LISTBOX_79 } from './select-allowlist';
export { SELECT_LISTBOX_79 } from './select-allowlist';

export function withoutSelectListbox79(violations: Result[], root: ParentNode = document) {
  return violations.flatMap((violation) => {
    const nodes = violation.nodes.filter((node) => {
      if (violation.id !== SELECT_LISTBOX_79.rule || node.target.length !== 1) return true;
      const selector = node.target[0];
      if (typeof selector !== 'string') return true;
      const element = root.querySelector(selector);
      return !element || !element.matches(SELECT_LISTBOX_79.selector);
    });
    return nodes.length ? [{ ...violation, nodes }] : [];
  });
}

export async function checkAxe() {
  // The render container and body portal hosts are page-level fixture containers.
  // Give them landmarks for the scan, then restore before collecting block output.
  const hosts = [...document.body.children].filter((element) => !element.hasAttribute('role'));
  const previous = hosts.map((element) => ({ element, label: element.getAttribute('aria-label') }));
  hosts.forEach((element, index) => {
    element.setAttribute('role', index === 0 ? 'main' : 'region');
    if (index > 0) element.setAttribute('aria-label', `Overlay ${index}`);
  });
  try {
    // jsdom has no computed colours; the browser matrix runs this rule too.
    const { violations } = await axe.run(document.body, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(withoutSelectListbox79(violations)).toEqual([]);
  } finally {
    for (const { element, label } of previous) {
      element.removeAttribute('role');
      if (label === null) element.removeAttribute('aria-label');
      else element.setAttribute('aria-label', label);
    }
  }
}

const clean = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim();

/** All text nodes and a11y attributes, including sr-only and portalled content. */
export function surfaces() {
  const elements = [...document.body.querySelectorAll('*')].filter(
    (element) => !element.closest('script, style, svg, [hidden], [data-ending-style]'),
  );
  const texts = elements.flatMap((element) => {
    const ownText = [...element.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('');
    return clean(ownText) ? [clean(ownText)] : [];
  });
  const attrs = elements.flatMap((element) =>
    ['aria-label', 'aria-description', 'title', 'placeholder', 'aria-valuetext'].flatMap((attribute) =>
      element.hasAttribute(attribute) ? [`${attribute}: ${element.getAttribute(attribute)}`] : [],
    ),
  );
  return { texts, attrs };
}

export function baseline() {
  const roleEntries = Object.entries(getRoles(document.body)).filter(
    ([role]) => role !== 'generic' && role !== 'presentation',
  );
  const names = new Map<Element, string>();
  const descriptions = new Map<Element, string>();
  const roleOf = new Map<Element, string>();
  for (const [role, elements] of roleEntries) {
    for (const element of elements) roleOf.set(element, role);
    // Public role-query matchers expose the computed accessible name and description.
    queryAllByRole(document.body, role, {
      name: (name, element) => {
        if (element) names.set(element, name);
        return true;
      },
      description: (description, element) => {
        if (element) descriptions.set(element, description);
        return true;
      },
    });
  }
  const ancestors = (element: Element) => {
    const roles: string[] = [];
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const role = roleOf.get(parent);
      if (role) roles.push(role);
    }
    return roles.reverse();
  };
  const roles = roleEntries.flatMap(([role, elements]) =>
    elements.map((element) => ({
      role,
      name: names.get(element),
      description: descriptions.get(element),
      ancestors: ancestors(element),
      tag: element.tagName,
      text: clean(element.textContent),
      label: element.getAttribute('aria-label'),
      sort: element.getAttribute('aria-sort'),
      checked: element.getAttribute('aria-checked'),
      expanded: element.getAttribute('aria-expanded'),
      current: element.getAttribute('aria-current'),
      value: element instanceof HTMLInputElement ? element.value : null,
    })),
  );
  return {
    ...surfaces(),
    roles,
    focus:
      document.activeElement === document.body
        ? 'BODY'
        : clean(document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? ''),
  };
}

export function assertInventory(expected: readonly string[], caller: readonly string[] = []) {
  const allowed = new Set([...expected, ...caller, ':']);
  const actual = surfaces();
  for (const text of actual.texts) expect(allowed.has(text), `unmapped text: ${text}`).toBe(true);
  for (const attr of actual.attrs) {
    const value = attr.slice(attr.indexOf(': ') + 2);
    expect(allowed.has(value), `unmapped attribute: ${attr}`).toBe(true);
  }
}

export const themes = ['dark', 'light', 'high_contrast'] as const;
