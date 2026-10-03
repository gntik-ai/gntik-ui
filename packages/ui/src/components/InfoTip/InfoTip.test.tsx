import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import InfoTipLabel from './examples/InfoTipLabel';
import InfoTipStat from './examples/InfoTipStat';

describe('InfoTip', () => {
  it('Tab focuses the named info button', async () => {
    const user = userEvent.setup();
    render(<InfoTipLabel />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'More information about log retention' })).toHaveFocus();
  });

  it('Enter opens the help and Escape closes it, returning focus', async () => {
    const user = userEvent.setup();
    render(<InfoTipLabel />);
    await user.tab();
    const trigger = screen.getByRole('button', { name: 'More information about log retention' });
    await user.keyboard('{Enter}');
    const panel = await screen.findByRole('dialog', { name: 'Log retention' });
    expect(panel).toHaveTextContent('Logs older than this are deleted every night.');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Space opens it too; without a title the dialog is named after the label', async () => {
    const user = userEvent.setup();
    render(<InfoTipStat />);
    await user.tab();
    await user.keyboard(' ');
    expect(await screen.findByRole('dialog', { name: 'monthly spend' })).toBeInTheDocument();
  });

  it('opens on hover when openOnHover is set', async () => {
    const user = userEvent.setup();
    render(<InfoTipStat />);
    await user.hover(screen.getByRole('button', { name: 'More information about monthly spend' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('before taxes');
  });

  it.each([
    ['label', InfoTipLabel, 'More information about log retention'],
    ['stat', InfoTipStat, 'More information about monthly spend'],
  ])('open %s example has no axe violations', async (_, Example, name) => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
