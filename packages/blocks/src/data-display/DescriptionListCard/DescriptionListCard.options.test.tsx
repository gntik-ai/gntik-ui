import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { DescriptionListCard } from './DescriptionListCard';

it('wraps a full unbroken value only when requested', () => {
  const value = 'x'.repeat(120);
  const items = [{ id: 'id', label: 'Identifier', value, mono: true, copyable: true }];
  const { rerender } = render(<DescriptionListCard items={items} wrap />);
  const span = screen.getByText(value);
  expect(span.tagName).toBe('SPAN');
  expect(span).not.toHaveClass('truncate');
  expect(span).toHaveClass('min-w-0', 'wrap-anywhere', 'font-mono');
  expect(span.textContent).toBe(value);
  expect(screen.getByRole('button', { name: 'Copy Identifier' })).toBeInTheDocument();
  rerender(<DescriptionListCard items={items} />);
  expect(screen.getByText(value)).toHaveClass('min-w-0', 'truncate');
});

it.each([
  [
    2,
    [
      ['Field 1', 'Field 2', 'Field 3', 'Field 4'],
      ['Field 5', 'Field 6', 'Field 7'],
    ],
  ],
  [3, [['Field 1', 'Field 2', 'Field 3'], ['Field 4', 'Field 5', 'Field 6'], ['Field 7']]],
] as const)('stacks terms and values in %i column-major groups', async (columns, expected) => {
  const items = Array.from({ length: 7 }, (_, index) => ({
    id: String(index),
    label: `Field ${index + 1}`,
    value: `Value ${index + 1}`,
  }));
  const { container } = render(<DescriptionListCard columns={columns} items={items} />);
  const groups = Array.from(container.querySelectorAll('dl'));
  expect(groups).toHaveLength(columns);
  const grid = groups[0]!.parentElement!;
  expect(grid).toHaveClass('grid', 'grid-cols-1', `sm:grid-cols-${columns}`);
  expect(Array.from(grid.classList).filter((name) => /border|divide/.test(name))).toEqual([]);
  expect(groups.map((group) => Array.from(group.querySelectorAll('dt'), (term) => term.textContent))).toEqual(expected);
  expect(Array.from(container.querySelectorAll('dt'), (term) => term.textContent)).toEqual([
    'Field 1',
    'Field 2',
    'Field 3',
    'Field 4',
    'Field 5',
    'Field 6',
    'Field 7',
  ]);
  for (const group of groups) {
    expect(group).toHaveClass('divide-y', 'divide-border');
    for (const row of Array.from(group.children)) {
      expect(row.tagName).toBe('DIV');
      expect(row).toHaveClass('grid', 'grid-cols-1');
      expect(row).not.toHaveClass('sm:grid-cols-[160px_minmax(0,1fr)]');
      expect(Array.from(row.children, (child) => child.tagName)).toEqual(['DT', 'DD']);
    }
  }
  for (const item of items) {
    expect(screen.getAllByText(item.label)).toHaveLength(1);
    expect(screen.getAllByText(item.value)).toHaveLength(1);
  }
  await expectNoAxeViolations(container);
});
