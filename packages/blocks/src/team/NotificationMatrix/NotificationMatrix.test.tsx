import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { NotificationMatrix } from './NotificationMatrix';

describe('NotificationMatrix', () => {
  it('renders the grid with mixed column state and locked cells', async () => {
    const { container } = render(<NotificationMatrix />);
    expect(screen.getByRole('table', { name: 'Notification preferences' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'All events by Email' })).toHaveAttribute('aria-checked', 'mixed');
    const locked = screen.getByRole('checkbox', { name: 'Security alerts by Email (always on)' });
    expect(locked).toBeChecked();
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    await expectNoAxeViolations(container);
  });

  it('toggles cells, rows and columns', async () => {
    const onValueChange = vi.fn();
    render(<NotificationMatrix onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Member joined by Push' }));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ 'member-joined': ['push'] }));

    await userEvent.click(screen.getByRole('checkbox', { name: 'All channels for Member joined' }));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ 'member-joined': ['email', 'in-app', 'push'] }));

    const emailCol = screen.getByRole('checkbox', { name: 'All events by Email' });
    await userEvent.click(emailCol);
    expect(emailCol).toBeChecked();
    await userEvent.click(emailCol);
    const last = onValueChange.mock.lastCall?.[0] as Record<string, string[]>;
    expect(last.security).toContain('email');
    expect(last['deploy-failed']).not.toContain('email');
  });
});
