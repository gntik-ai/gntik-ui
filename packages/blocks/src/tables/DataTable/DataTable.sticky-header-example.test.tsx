import { render, screen, within } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import StickyHeaderExample from './examples/sticky-header';
import StickyHeaderStackedExample from './examples/sticky-header-stacked';

const mode = (table: HTMLElement) => table.closest('[data-sticky-header]')?.getAttribute('data-sticky-header');

it('pins a long table under the topbar and bounds a second table with maxHeight', () => {
  render(<StickyHeaderExample />);
  const sidebar = within(screen.getByRole('group', { name: /sidebar layout/ }));
  const bounded = within(screen.getByRole('group', { name: /maxHeight/ }));
  expect(mode(sidebar.getByRole('table'))).toBe('page');
  expect(sidebar.getAllByRole('row')).toHaveLength(61);
  expect(mode(bounded.getByRole('table'))).toBe('bounded');
  expect(bounded.getByRole('region', { name: 'Recent deployments' })).toHaveStyle({ maxHeight: '320px' });
});

it('offsets the header of the stacked layout by its 60 px bar', () => {
  render(<StickyHeaderStackedExample />);
  for (const name of ['Runs', 'Audit events']) {
    const card = screen.getByRole('table', { name }).closest<HTMLElement>('[data-sticky-header]')!;
    expect(card.style.getPropertyValue('--data-table-sticky-top')).toBe('60px');
  }
});

describe.each([
  ['sidebar layout and maxHeight', StickyHeaderExample],
  ['stacked layout', StickyHeaderStackedExample],
])('%s example', (_name, Example) => {
  it.each(['dark', 'light', 'high_contrast'])('has no axe violations in %s', async (theme) => {
    document.documentElement.className = theme;
    const { container } = render(<Example />);
    await expectNoAxeViolations(container);
  });
});
