import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { filterCommandGroups, scoreCommand } from './command-filter';
import CommandPaletteBasic from './examples/CommandPaletteBasic';

async function openWithShortcut(combo = '{Meta>}k{/Meta}') {
  const user = userEvent.setup();
  render(<CommandPaletteBasic />);
  await user.keyboard(combo);
  const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
  const input = within(dialog).getByRole('combobox');
  await waitFor(() => expect(input).toHaveFocus());
  return { user, dialog, input };
}

const options = (dialog: HTMLElement) => within(dialog).getAllByRole('option');
const highlighted = (dialog: HTMLElement) => dialog.querySelector('[role="option"][data-highlighted]');

describe('CommandPalette', () => {
  it('ranks prefix > word start > subsequence and searches keywords', () => {
    expect(scoreCommand({ id: 'a', label: 'Projects' }, 'pro')).toBeGreaterThan(scoreCommand({ id: 'b', label: 'Create project' }, 'pro'));
    expect(scoreCommand({ id: 'a', label: 'Create project' }, 'crp')).toBeGreaterThan(0);
    expect(scoreCommand({ id: 'a', label: 'Billing', keywords: ['invoices'] }, 'invoice')).toBeGreaterThan(0);
    expect(scoreCommand({ id: 'a', label: 'Billing' }, 'xyz')).toBe(-1);
    const groups = filterCommandGroups([{ label: 'G', items: [{ id: 'a', label: 'Analytics' }] }], '', [{ id: 'a', label: 'Analytics' }]);
    expect(groups.map((g) => g.value)).toEqual(['Recent', 'G']);
  });

  it.each([['{Meta>}k{/Meta}'], ['{Control>}k{/Control}']])('%s opens the palette with groups and recent items', async (combo) => {
    const { dialog } = await openWithShortcut(combo);
    expect(within(dialog).getByText('Recent')).toBeInTheDocument();
    expect(within(dialog).getByText('Actions')).toBeInTheDocument();
    expect(options(dialog)).toHaveLength(12);
    expect(highlighted(dialog)).toHaveTextContent('web-frontend');
  });

  it('the trigger button opens it too', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteBasic />);
    await user.click(screen.getByRole('button', { name: /Search or run a command/ }));
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
  });

  it('typing filters and ranks the commands', async () => {
    const { user, dialog } = await openWithShortcut();
    await user.keyboard('proj');
    await waitFor(() => expect(within(dialog).queryByText('Recent')).not.toBeInTheDocument());
    const labels = options(dialog).map((o) => o.textContent);
    expect(labels[0]).toMatch(/Create project/);
    expect(labels).toEqual(expect.arrayContaining([expect.stringMatching(/^Projects/)]));
    expect(within(dialog).getByText(/3 results/)).toBeInTheDocument();
    await user.clear(within(dialog).getByRole('combobox'));
    await user.keyboard('invoices');
    await waitFor(() => expect(options(dialog)).toHaveLength(1));
    expect(options(dialog)[0]).toHaveTextContent('Billing');
  });

  it('shows the empty state when nothing matches', async () => {
    const { user, dialog } = await openWithShortcut();
    await user.keyboard('qqqq');
    expect(await within(dialog).findByText(/No results for/)).toBeInTheDocument();
    expect(within(dialog).queryAllByRole('option')).toHaveLength(0);
  });

  it('ArrowDown / ArrowUp move the highlight across groups', async () => {
    const { user, dialog } = await openWithShortcut();
    expect(highlighted(dialog)).toHaveTextContent('web-frontend');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted(dialog)).toHaveTextContent('billing-api'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted(dialog)).toHaveTextContent('Create project'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(highlighted(dialog)).toHaveTextContent('billing-api'));
  });

  it('Enter runs the highlighted command and closes', async () => {
    const { user } = await openWithShortcut();
    await user.keyboard('deploy');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Deploy to production', { selector: 'span' })).toBeInTheDocument();
  });

  it('Escape closes and returns focus to the trigger; reopening resets the query', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteBasic />);
    const trigger = screen.getByRole('button', { name: /Search or run a command/ });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByRole('combobox')).toHaveFocus());
    await user.keyboard('bill');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    await user.keyboard('{Control>}k{/Control}');
    const again = await screen.findByRole('dialog');
    expect(within(again).getByRole('combobox')).toHaveValue('');
  });

  it('open palette has no axe violations', async () => {
    const { user } = await openWithShortcut();
    await expectNoAxeViolations();
    await user.keyboard('zzzz');
    await expectNoAxeViolations();
  });
});
