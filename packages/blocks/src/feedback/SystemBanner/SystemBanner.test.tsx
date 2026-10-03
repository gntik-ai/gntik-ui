import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SystemBanner } from './SystemBanner';

describe('SystemBanner', () => {
  it('renders the default maintenance banner', async () => {
    const { container } = render(<SystemBanner />);
    expect(screen.getByRole('status')).toHaveTextContent('Scheduled maintenance.');
    expect(screen.getByRole('link', { name: 'View details' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('announces incidents assertively and hides on dismiss', async () => {
    const onDismiss = vi.fn();
    render(<SystemBanner kind="incident" title="Degraded API." message="Elevated error rates in eu-west-1." onDismiss={onDismiss} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Degraded API.');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
