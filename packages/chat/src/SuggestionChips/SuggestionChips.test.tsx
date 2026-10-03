import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SuggestionChipsZeroState from './examples/SuggestionChipsZeroState';
import { SuggestionChips } from './SuggestionChips';

describe('SuggestionChips', () => {
  it('Tab moves between suggestions; Enter and Space select with the prompt', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <SuggestionChips
        heading="Try asking"
        onSelect={onSelect}
        suggestions={[{ label: 'Find unpaid invoices', prompt: 'List unpaid invoices from last month' }, 'Export as CSV']}
      />,
    );
    expect(screen.getByRole('group', { name: 'Try asking' })).toBeInTheDocument();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('List unpaid invoices from last month', expect.objectContaining({ label: 'Find unpaid invoices' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Export as CSV' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenLastCalledWith('Export as CSV', { label: 'Export as CSV' });
  });

  it('disabled suggestions do nothing', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SuggestionChips layout="chips" disabled onSelect={onSelect} suggestions={['A']} />);
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('example has no axe violations', async () => {
    const { container } = render(<SuggestionChipsZeroState />);
    await expectNoAxeViolations(container);
  });
});
