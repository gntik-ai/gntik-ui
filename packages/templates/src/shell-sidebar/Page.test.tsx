import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ShellSidebarPage from './Page';

describe('ShellSidebarPage', () => {
  it('renders the console frame with an empty page', { timeout: 15000 }, async () => {
    const { container } = render(<ShellSidebarPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Create your first project' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('runs the first-run action', { timeout: 15000 }, async () => {
    const onCreate = vi.fn();
    render(<ShellSidebarPage onCreate={onCreate} />);
    await userEvent.click(screen.getByRole('button', { name: 'New project' }));
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
