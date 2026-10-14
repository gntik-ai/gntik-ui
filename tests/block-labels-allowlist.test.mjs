import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectListbox79 } from '../apps/docs/e2e/fixtures/select79-allowlist.mjs';

test('#79 removes only the exact Select listbox node from aria-input-field-name', () => {
  const listbox = { target: ['#select-list'] };
  const other = { target: ['#other-list'] };
  const result = selectListbox79([{ id: 'aria-input-field-name', nodes: [listbox, other] }], ['#select-list']);
  assert.deepEqual(result, [{ id: 'aria-input-field-name', nodes: [other] }]);
});
test('#79 retains other rules on the listbox and gives focus guards no exemption', () => {
  const violations = [
    { id: 'aria-required-attr', nodes: [{ target: ['#select-list'] }] },
    { id: 'aria-hidden-focus', nodes: [{ target: ['span[data-base-ui-focus-guard]'] }] },
  ];
  assert.deepEqual(selectListbox79(violations, ['#select-list']), violations);
});
test('#79 retains all violations when no Select popup is open', () => {
  const violations = [{ id: 'aria-input-field-name', nodes: [{ target: ['#other-list'] }] }];
  assert.deepEqual(selectListbox79(violations, null), violations);
});
