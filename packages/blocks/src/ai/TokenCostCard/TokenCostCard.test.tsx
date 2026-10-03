import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { TokenCostCard } from './TokenCostCard';

describe('TokenCostCard', () => {
  it('shows token counts, cost and the budget meter for the default period', async () => {
    render(<TokenCostCard />);
    expect(screen.getByText('8.9M')).toBeInTheDocument();
    expect(screen.getByText('1.4M')).toBeInTheDocument();
    expect(screen.getByText('$102.40')).toBeInTheDocument();
    const meter = screen.getByRole('meter', { name: 'Budget' });
    expect(meter).toHaveAttribute('aria-valuetext', '$102.40 of $250.00');
    expect(screen.getByText('$147.60 left in this period')).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('switches period', async () => {
    const user = userEvent.setup();
    render(<TokenCostCard />);
    await user.click(screen.getByRole('button', { name: '30d' }));
    expect(screen.getByText('$431.75')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Budget' })).toHaveAttribute('aria-valuetext', '$431.75 of $500.00');
  });

  it('reports overspend and hides the switch for a single period', () => {
    render(<TokenCostCard periods={[{ id: 'm', label: 'Month', inputTokens: 10, outputTokens: 0, cost: 60, budget: 50 }]} currency="EUR" />);
    expect(screen.queryByRole('group', { name: 'Period' })).not.toBeInTheDocument();
    expect(screen.getByText('€10.00 over budget')).toBeInTheDocument();
  });
});
