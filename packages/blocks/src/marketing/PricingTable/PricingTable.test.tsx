import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PricingTable } from './PricingTable';

describe('PricingTable', () => {
  it('renders the tiers with monthly prices', async () => {
    const { container } = render(<PricingTable />);
    const team = screen.getByRole('listitem', { name: 'Team' });
    expect(within(team).getByText('$49')).toBeInTheDocument();
    expect(within(team).getByText('Most popular')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: 'Enterprise' })).getByText('Custom')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches to annual pricing and reports the chosen tier', async () => {
    const user = userEvent.setup();
    const onSelectTier = vi.fn();
    render(<PricingTable onSelectTier={onSelectTier} />);
    await user.click(screen.getByRole('button', { name: /Annual/ }));
    const team = screen.getByRole('listitem', { name: 'Team' });
    expect(within(team).getByText('$39')).toBeInTheDocument();
    expect(within(team).getByText('$468 billed yearly')).toBeInTheDocument();
    await user.click(within(team).getByRole('button', { name: 'Start free trial' }));
    expect(onSelectTier).toHaveBeenCalledWith(expect.objectContaining({ id: 'team' }), 'annual');
  });
});
