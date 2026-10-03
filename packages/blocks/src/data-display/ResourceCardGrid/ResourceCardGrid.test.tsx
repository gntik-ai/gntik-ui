import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ResourceCardGrid } from './ResourceCardGrid';

describe('ResourceCardGrid', () => {
  it('renders one card per resource', async () => {
    const { container } = render(<ResourceCardGrid />);
    expect(screen.getByRole('list', { name: 'Resources' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
    expect(screen.getByText('Degraded')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('runs a menu action for the card', async () => {
    const onAction = vi.fn();
    render(<ResourceCardGrid onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions for orders-db' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledWith('delete', expect.objectContaining({ id: 'db' }));
  });
});
