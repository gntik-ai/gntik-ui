import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Badge } from './Badge';
import BadgeTones from './examples/BadgeTones';
import BadgeRemovable from './examples/BadgeRemovable';

describe('Badge', () => {
  it('renders its label with tone classes and merges className', () => {
    render(<Badge tone="success" className="ml-2">Healthy</Badge>);
    const badge = screen.getByText('Healthy');
    expect(badge).toHaveClass('bg-success/15', 'text-success-text', 'ml-2');
  });

  it('uses text-foreground (not the raw tone) for info and category tones', () => {
    render(<><Badge tone="info">Queued</Badge><Badge tone="violet" variant="outline">Design</Badge></>);
    expect(screen.getByText('Queued')).toHaveClass('text-foreground');
    expect(screen.getByText('Design')).toHaveClass('text-foreground', 'border-category-violet/45');
  });

  it('Tab focuses the remove button, which is named after the label', async () => {
    const user = userEvent.setup();
    render(<Badge onRemove={() => {}}>staging</Badge>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove staging' })).toHaveFocus();
  });

  it('Enter activates the remove button', async () => {
    const user = userEvent.setup();
    render(<BadgeRemovable />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove production' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByText('production')).not.toBeInTheDocument();
  });

  it('Space activates the remove button', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Badge onRemove={onRemove} removeLabel="Remove filter">region</Badge>);
    await user.tab();
    await user.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('examples have no axe violations', async () => {
    render(<><BadgeTones /><BadgeRemovable /></>);
    await expectNoAxeViolations();
  });
});
