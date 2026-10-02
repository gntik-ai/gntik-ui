import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Alert } from './Alert';
import AlertTones from './examples/AlertTones';
import AlertDismissible from './examples/AlertDismissible';

describe('Alert', () => {
  it('uses role status for non-destructive tones and alert for destructive', () => {
    render(<AlertTones />);
    expect(screen.getAllByRole('status')).toHaveLength(3);
    const alert = screen.getByRole('alert', { name: '3 deployments failing' });
    expect(alert).toHaveAccessibleDescription(/Health checks in us-east-1/);
  });

  it('pairs the title with contrast-safe text tokens', () => {
    render(<><Alert tone="warning" title="Warn" /><Alert tone="info" title="Note" /></>);
    expect(screen.getByText('Warn')).toHaveClass('text-warning-text');
    expect(screen.getByText('Note')).toHaveClass('text-foreground');
  });

  it('Tab reaches the actions and then the dismiss button', async () => {
    const user = userEvent.setup();
    render(<AlertDismissible />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add payment method' })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveFocus();
  });

  it('Enter activates the dismiss button', async () => {
    const user = userEvent.setup();
    render(<AlertDismissible />);
    screen.getByRole('button', { name: 'Dismiss' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show alert again' })).toBeInTheDocument();
  });

  it('Space activates the dismiss button', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Alert tone="info" title="Heads up" onDismiss={onDismiss} dismissLabel="Close notice" />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close notice' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('can hide the icon and override the role', () => {
    const { container } = render(<Alert icon={null} role="note" title="Tip" />);
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByRole('note', { name: 'Tip' })).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    render(<><AlertTones /><AlertDismissible /></>);
    await expectNoAxeViolations();
  });
});
