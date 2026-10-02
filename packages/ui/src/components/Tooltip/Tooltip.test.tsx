import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import TooltipRich from './examples/TooltipRich';
import TooltipToolbar from './examples/TooltipToolbar';

describe('Tooltip', () => {
  it('shows on keyboard focus and hides when focus moves away', async () => {
    const user = userEvent.setup();
    render(<TooltipToolbar />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Search');
    expect(tip).toHaveTextContent('⌘K');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Pause deployment' })).toHaveFocus();
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Pause deployment'));
    await waitFor(() => expect(screen.getAllByRole('tooltip')).toHaveLength(1));
  });

  it('Escape hides the tooltip and keeps focus on the trigger', async () => {
    const user = userEvent.setup();
    render(<TooltipToolbar />);
    await user.tab();
    const trigger = screen.getByRole('button', { name: 'Search' });
    await screen.findByRole('tooltip');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('shows on hover after the delay', async () => {
    const user = userEvent.setup();
    render(<TooltipRich />);
    await user.hover(screen.getByRole('button', { name: 'Seats: 18 of 20' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Seats almost full');
    await user.unhover(screen.getByRole('button', { name: 'Seats: 18 of 20' }));
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('open solid tooltip has no axe violations', async () => {
    const user = userEvent.setup();
    render(<TooltipToolbar />);
    await user.tab();
    await screen.findByRole('tooltip');
    await expectNoAxeViolations();
  });

  it('open rich tooltip has no axe violations', async () => {
    const user = userEvent.setup();
    render(<TooltipRich />);
    await user.tab();
    await screen.findByRole('tooltip');
    await expectNoAxeViolations();
  });
});
