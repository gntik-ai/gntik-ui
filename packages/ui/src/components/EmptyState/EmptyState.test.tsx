import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { expectNoAxeViolations } from '../../test/a11y';
import { EmptyState } from './EmptyState';
import EmptyStateProjects from './examples/EmptyStateProjects';
import EmptyStateSearch from './examples/EmptyStateSearch';

describe('EmptyState', () => {
  it('renders a heading, description and both actions', () => {
    render(<EmptyStateProjects />);
    expect(screen.getByRole('heading', { level: 3, name: 'No projects yet' })).toBeInTheDocument();
    expect(screen.getByText(/Create your first project/)).toHaveClass('text-muted-foreground');
    expect(screen.getByRole('button', { name: 'New project' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
  });

  it('keeps the icon decorative and supports size, border and heading level', () => {
    const { container } = render(<EmptyState icon={Inbox} title="Inbox zero" titleAs="h2" size="lg" bordered />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('heading', { level: 2, name: 'Inbox zero' })).toHaveClass('text-[17px]');
    expect(container.firstElementChild).toHaveClass('border-dashed', 'py-16');
  });

  it('omits the actions row when there are no actions', () => {
    const { container } = render(<EmptyState title="Nothing here" />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.firstElementChild?.children).toHaveLength(1);
  });

  it('examples have no axe violations', async () => {
    render(<><EmptyStateProjects /><EmptyStateSearch /></>);
    await expectNoAxeViolations();
  });
});
