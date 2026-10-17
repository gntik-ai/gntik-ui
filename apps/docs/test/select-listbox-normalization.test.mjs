import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSelectListboxNames } from '../e2e/block-labels.helpers.js';

const row = {
  tag: 'DIV',
  role: 'listbox',
  'aria-label': 'Filas por página',
  'aria-description': null,
  title: null,
  placeholder: null,
  'aria-valuetext': null,
  live: null,
};
const parent = { ...row, role: 'region', 'aria-label': 'Items' };
const current = {
  attributes: [parent, row],
  text: ['Items', '10', '25'],
  names: [
    { role: 'combobox', name: 'Filas por página' },
    { role: 'option', name: '10' },
  ],
  tree: '- main:\n  - region "Items":\n    - listbox "Filas por página":\n      - option "10" [selected]\n      - option "25"',
  callbacks: [['page', [1]]],
};
const pairs = [{ listboxId: 'rows', triggerNodeId: 42, name: 'Filas por página' }];
const baseline = {
  ...current,
  attributes: [parent],
  tree: '- main:\n  - region "Items":\n    - listbox:\n      - option "10" [selected]\n      - option "25"',
};

test('only the paired listbox name changes in the published surfaces comparison', () => {
  const original = structuredClone(current);
  assert.deepEqual(normalizeSelectListboxNames(current, pairs), baseline);
  assert.deepEqual(current, original);
});

test('a checkpoint with no pair preserves every surface, even a named listbox', () => {
  assert.deepEqual(normalizeSelectListboxNames(current, []), current);
});

test('missing or changed listbox attributes fail closed', () => {
  for (const changed of [
    null,
    ...Object.keys(row).map((key) => ({ ...row, [key]: 'Unexpected' })),
    { ...row, extra: null },
  ]) {
    assert.throws(
      () => normalizeSelectListboxNames({ ...current, attributes: changed ? [parent, changed] : [parent] }, pairs),
      /exact listbox attributes row/,
    );
  }
});

test('stray parent labels, duplicate rows and other listboxes remain regressions', () => {
  for (const extra of [{ ...parent, 'aria-label': 'Stray label' }, row, { ...row, 'aria-label': 'Unpaired listbox' }]) {
    const normalized = normalizeSelectListboxNames({ ...current, attributes: [...current.attributes, extra] }, pairs);
    assert.deepEqual(normalized.attributes, [parent, extra]);
    assert.notDeepEqual(normalized, baseline);
  }
});

test('absent, changed or ambiguous named tree lines fail closed', () => {
  for (const tree of [
    '- listbox',
    '- listbox "Filas por página extra":',
    '- listbox "Filas por página" [disabled]:',
    '- listbox "Filas por página":\n- listbox "Filas por página":',
  ]) {
    assert.throws(() => normalizeSelectListboxNames({ ...current, tree }, pairs), /exactly one named listbox line/);
  }
});

test('every pair removes one row and only its exact tree line, including an empty listbox', () => {
  const second = { ...row, 'aria-label': 'Vista "guardada"' };
  const input = {
    ...current,
    attributes: [...current.attributes, second],
    tree: `${current.tree}\n  - listbox "Vista \\"guardada\\""\n  - listbox "Unpaired":\n    - option "Other"`,
  };
  assert.deepEqual(
    normalizeSelectListboxNames(input, [...pairs, { listboxId: 'views', triggerNodeId: 43, name: 'Vista "guardada"' }]),
    {
      ...baseline,
      tree: `${baseline.tree}\n  - listbox\n  - listbox "Unpaired":\n    - option "Other"`,
    },
  );
});
