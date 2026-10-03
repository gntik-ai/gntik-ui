import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PlanCard } from './PlanCard';

describe('PlanCard', () => {
  it('renders the sample plan', async () => {
    const { container } = render(<PlanCard />);
    expect(screen.getByRole('heading', { name: 'Scale plan' })).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText(/Renews June 1, 2026/)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches the cycle and fires the actions', async () => {
    const user = userEvent.setup();
    const onUpgrade = vi.fn();
    const onCycleChange = vi.fn();
    render(<PlanCard onUpgrade={onUpgrade} onCycleChange={onCycleChange} />);
    await user.click(screen.getByRole('button', { name: /Annual/ }));
    expect(onCycleChange).toHaveBeenCalledWith('annual');
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText(/Billed annually/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Upgrade plan' }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });
});
