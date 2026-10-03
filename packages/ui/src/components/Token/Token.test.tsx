import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Token } from './Token';
import TokenFilters from './examples/TokenFilters';
import TokenRecipients from './examples/TokenRecipients';

describe('Token', () => {
  it('renders label, prefix and tone classes, merging className', () => {
    render(<Token tone="success" prefix="Status:" label="Paid" className="ml-2" />);
    const root = screen.getByText('Paid').parentElement as HTMLElement;
    expect(root).toHaveClass('text-success-chip-text', 'ml-2');
    expect(screen.getByText('Status:')).toHaveClass('text-muted-foreground');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('Tab focuses the remove button, named "Remove {label}"', async () => {
    const user = userEvent.setup();
    render(<Token label="eu-west-1" onRemove={() => {}} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove eu-west-1' })).toHaveFocus();
  });

  it.each([['Enter', '{Enter}'], ['Space', ' '], ['Backspace', '{Backspace}'], ['Delete', '{Delete}']])(
    '%s removes the token',
    async (_, key) => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(<Token label="staging" onRemove={onRemove} />);
      await user.tab();
      await user.keyboard(key);
      expect(onRemove).toHaveBeenCalledTimes(1);
    },
  );

  it('removes a filter chip in the example', async () => {
    const user = userEvent.setup();
    render(<TokenFilters />);
    await user.tab();
    await user.keyboard('{Backspace}');
    expect(screen.queryByText('Failed')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByText('No filters applied')).toBeInTheDocument();
  });

  it('disabled tokens cannot be removed', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Token label="Billing owner" onRemove={onRemove} disabled />);
    const button = screen.getByRole('button', { name: 'Remove Billing owner' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('examples have no axe violations', async () => {
    render(<><TokenFilters /><TokenRecipients /></>);
    await expectNoAxeViolations();
  });
});
