import { SimpleSelect } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { SELECT_LISTBOX_79, withoutSelectListbox79 } from './matrix';

it('exempts only the #79 Select listbox node and preserves other nodes and rules', async () => {
  render(
    <>
      <SimpleSelect aria-label="Choice" items={[{ value: 'a', label: 'A' }]} />
      <div role="listbox">
        <div role="option" aria-selected="false">
          Other
        </div>
      </div>
    </>,
  );
  await userEvent.click(screen.getByRole('combobox', { name: 'Choice' }));
  const listboxes = screen.getAllByRole('listbox');
  const select = listboxes.find((element) => element.classList.contains('outline-none'))!;
  expect(select.matches(SELECT_LISTBOX_79.selector)).toBe(true);
  const { violations } = await axe.run(document.body, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  const filtered = withoutSelectListbox79(violations);
  const naming = filtered.find((violation) => violation.id === 'aria-input-field-name');
  expect(naming?.nodes).toHaveLength(1);
  expect(naming?.nodes[0]?.html).toContain('Other');
  const namingViolation = violations.find((violation) => violation.id === 'aria-input-field-name')!;
  // A different rule on the same node must never be removed.
  expect(withoutSelectListbox79([{ ...namingViolation, id: 'different-rule' }])).toEqual([
    { ...namingViolation, id: 'different-rule' },
  ]);
});
