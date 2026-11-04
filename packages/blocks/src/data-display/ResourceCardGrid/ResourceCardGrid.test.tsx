import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ResourceCardGrid } from './ResourceCardGrid';

describe('ResourceCardGrid', () => {
  it('keeps list semantics and styling separate from wrapper placement', () => {
    const { container } = render(
      <ResourceCardGrid label="Services" className="gap-6" containerClassName="col-span-2" />,
    );
    const list = screen.getByRole('list', { name: 'Services' });
    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass('gap-6');
    expect(list).not.toHaveClass('col-span-2');
    expect(list.parentElement).toBe(container.firstElementChild);
    expect(list.parentElement).toHaveClass('col-span-2');
    expect(list.parentElement).not.toHaveClass('gap-6');
  });

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
