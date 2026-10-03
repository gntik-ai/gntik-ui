import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SpendVsBudget } from './SpendVsBudget';

describe('SpendVsBudget', () => {
  it('renders the summary and the chart figure', async () => {
    const { container } = render(<SpendVsBudget />);
    expect(screen.getByRole('heading', { name: 'Spend vs budget' })).toBeInTheDocument();
    expect(screen.getByText('Within budget')).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /spent, .* forecast against a \$2,000.00 budget/ })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('flags a forecast over budget and toggles series from the legend', async () => {
    const user = userEvent.setup();
    render(<SpendVsBudget budget={1500} />);
    expect(screen.getByText('Forecast over budget')).toBeInTheDocument();
    const budget = screen.getByRole('button', { name: 'Budget' });
    expect(budget).toHaveAttribute('aria-pressed', 'true');
    await user.click(budget);
    expect(budget).toHaveAttribute('aria-pressed', 'false');
  });
});
