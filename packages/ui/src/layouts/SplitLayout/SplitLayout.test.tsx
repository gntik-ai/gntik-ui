import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SplitLayout } from './SplitLayout';
import SplitLayoutInvoices from './examples/SplitLayoutInvoices';

describe('SplitLayout', () => {
  it('renders the two labelled regions and the resize handle', () => {
    render(<SplitLayoutInvoices />);
    expect(screen.getByRole('region', { name: 'Invoices' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Invoice details' })).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Resize invoices' })).toHaveAttribute('aria-valuenow', '35');
  });

  it('arrow keys and Home on the handle resize the list pane', async () => {
    const user = userEvent.setup();
    render(<SplitLayoutInvoices />);
    const handle = screen.getByRole('separator', { name: 'Resize invoices' });
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '40');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(handle).toHaveAttribute('aria-valuenow', '30');
    await user.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '20');
  });

  it('selecting an item shows the detail; Back returns to the list and focuses it', async () => {
    const user = userEvent.setup();
    const { container } = render(<SplitLayoutInvoices />);
    const root = container.querySelector('[data-show-detail]');
    expect(root).toBeNull();
    await user.click(screen.getByRole('button', { name: /INV-2043/ }));
    expect(container.querySelector('[data-show-detail]')).toHaveAttribute('data-show-detail', 'true');
    expect(screen.getByRole('heading', { name: 'INV-2043' })).toBeInTheDocument();
    const back = screen.getByRole('button', { name: 'Back' });
    back.focus();
    await user.keyboard('{Enter}');
    expect(container.querySelector('[data-show-detail]')).toBeNull();
    await waitFor(() => expect(screen.getByRole('region', { name: 'Invoices' })).toHaveFocus());
  });

  it('uncontrolled: defaultShowDetail and Back work without props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<SplitLayout list="list" detail="detail" defaultShowDetail onShowDetailChange={onChange} />);
    expect(container.querySelector('[data-show-detail]')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(container.querySelector('[data-show-detail]')).toBeNull();
  });

  it('has no axe violations (list and detail states)', async () => {
    const user = userEvent.setup();
    render(<SplitLayoutInvoices />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: /INV-2041/ }));
    await expectNoAxeViolations();
  });
});
