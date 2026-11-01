import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { GlobalSearch } from './GlobalSearch';

describe('GlobalSearch', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows Ctrl for the Create project shortcut on Linux', async () => {
    vi.stubGlobal('navigator', { platform: 'Linux x86_64' });
    const user = userEvent.setup();
    render(<GlobalSearch />);
    await user.click(screen.getByRole('button', { name: /Search/ }));
    const item = await screen.findByRole('option', { name: /Create project/ });
    expect(within(item).getByText('Ctrl')).toBeInTheDocument();
    expect(within(item).queryByText('⌘')).not.toBeInTheDocument();
  });

  it('renders the trigger with the shortcut hint', async () => {
    const { container } = render(<GlobalSearch />);
    expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('⌘K opens it with recent and grouped results; choosing one reports its group', async () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<GlobalSearch onSelect={onSelect} />);
    await user.keyboard('{Meta>}k{/Meta}');
    const dialog = await screen.findByRole('dialog', { name: 'Global search' });
    for (const heading of ['Recent', 'Pages', 'Records', 'Actions'])
      expect(within(dialog).getByText(heading)).toBeInTheDocument();
    await expectNoAxeViolations();
    await user.keyboard('INV-2041');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'record-inv-2041' });
    expect(onSelect.mock.calls[0]?.[1]).toBe('records');
  }, 15_000);
});
