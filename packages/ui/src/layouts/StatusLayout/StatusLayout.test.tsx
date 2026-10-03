import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'lucide-react';
import { expectNoAxeViolations } from '../../test/a11y';
import StatusLayoutMaintenance from './examples/StatusLayoutMaintenance';
import StatusLayoutNotFound from './examples/StatusLayoutNotFound';
import { StatusLayout } from './StatusLayout';

describe('StatusLayout', () => {
  it('renders code, an h1 title, description and landmarks', () => {
    const { container } = render(<StatusLayoutNotFound />);
    expect(container.querySelector('.h-full')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'We can’t find that page' })).toBeInTheDocument();
    expect(screen.getByText('404 · Not found')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('the primary action comes first in tab order', async () => {
    const user = userEvent.setup();
    render(
      <StatusLayout title="Forbidden" primaryAction={<button type="button">Request access</button>} secondaryAction={<button type="button">Switch workspace</button>} />,
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Request access' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Switch workspace' })).toHaveFocus();
  });

  it('within main the example’s primary action is the first focusable element', () => {
    render(<StatusLayoutNotFound />);
    const main = screen.getByRole('main');
    const first = main.querySelector('a[href], button');
    expect(first).toHaveTextContent('Go to dashboard');
  });

  it('shows an icon halo with the tone, or an illustration instead', () => {
    const { rerender } = render(<StatusLayout title="No results" icon={Search} tone="destructive" code="500" />);
    expect(screen.getByText('500')).toHaveClass('text-destructive-text');
    rerender(<StatusLayout title="No results" icon={Search} illustration={<svg data-testid="art" aria-hidden />} />);
    expect(screen.getByTestId('art')).toBeInTheDocument();
  });

  it('the maintenance example reports a recheck', async () => {
    const user = userEvent.setup();
    render(<StatusLayoutMaintenance />);
    await user.click(within(screen.getByRole('main')).getByRole('button', { name: 'Check again' }));
    expect(screen.getByText(/Still in maintenance/)).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    const { unmount } = render(<StatusLayoutNotFound />);
    await expectNoAxeViolations();
    unmount();
    render(<StatusLayoutMaintenance />);
    await expectNoAxeViolations();
  });
});
