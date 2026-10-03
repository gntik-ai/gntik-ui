import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ErrorPanel } from './ErrorPanel';

describe('ErrorPanel', () => {
  it('renders the default panel', async () => {
    const { container } = render(<ErrorPanel onRetry={() => {}} />);
    expect(screen.getByRole('region', { name: 'We couldn’t load deployments' })).toBeInTheDocument();
    expect(screen.getByText('req_8f2c41d07a9b')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('shows a loading state while retrying and reveals details', async () => {
    const user = userEvent.setup();
    let resolve = () => {};
    const onRetry = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<ErrorPanel onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    const busy = screen.getByRole('button', { name: 'Retrying…' });
    expect(busy).toHaveAttribute('aria-busy', 'true');
    resolve();
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeEnabled();

    const toggle = screen.getByRole('button', { name: 'Technical details' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/503 Service Unavailable/)).toBeVisible();
  });
});
