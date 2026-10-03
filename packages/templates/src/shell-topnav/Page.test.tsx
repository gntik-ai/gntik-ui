import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ShellTopnavPage from './Page';

describe('ShellTopnavPage', () => {
  it('renders the navbar, page header and empty body', { timeout: 15000 }, async () => {
    const { container } = render(<ShellTopnavPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations(container);
  });

  it('moves the current link on navigation', { timeout: 15000 }, async () => {
    const onNavigate = vi.fn();
    render(<ShellTopnavPage onNavigate={onNavigate} />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await userEvent.click(within(nav).getByRole('link', { name: 'Deployments' }));
    expect(within(nav).getByRole('link', { name: 'Deployments' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Projects' })).not.toHaveAttribute('aria-current');
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ label: 'Deployments' }));
  });
});
