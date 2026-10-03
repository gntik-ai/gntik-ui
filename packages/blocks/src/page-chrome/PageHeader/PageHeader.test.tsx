import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the default header', async () => {
    const { container } = render(<PageHeader />);
    expect(screen.getByRole('heading', { level: 1, name: 'Deployments' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Page sections' })).toBeInTheDocument();
    expect(screen.getByText('eu-west-1')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('runs actions and reports tab changes', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onTabChange = vi.fn();
    render(
      <PageHeader
        breadcrumbs={null}
        actions={[{ label: 'Export', variant: 'secondary' }, { label: 'Create', onClick: onCreate }]}
        onTabChange={onTabChange}
      />,
    );
    // Desktop row + compact row both carry the primary action (CSS picks one).
    const [create] = screen.getAllByRole('button', { name: 'Create' });
    await user.click(create!);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Domains/ }));
    expect(onTabChange).toHaveBeenCalledWith('domains');
  });
});
