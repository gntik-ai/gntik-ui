import { samplePricingTiers } from '@gntik-ai/blocks';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import PricingPage from './Page';

describe('PricingPage', () => {
  it('renders the nav, tiers, comparison and FAQ', { timeout: 15000 }, async () => {
    render(<PricingPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: 'Primary' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Simple pricing that grows with you' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Plan comparison' });
    const head = within(table).getAllByRole('rowgroup')[0]!;
    expect(within(head).getAllByRole('columnheader')).toHaveLength(samplePricingTiers.length + 1);
    const sso = within(table).getByRole('rowheader', { name: 'Single sign-on' }).closest('tr');
    expect(sso).not.toBeNull();
    expect(within(sso as HTMLElement).getAllByText('Not included')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: /questions/i })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('selects a tier with the billing cycle', { timeout: 15000 }, async () => {
    const onSelectTier = vi.fn();
    render(<PricingPage onSelectTier={onSelectTier} />);
    await userEvent.click(screen.getByRole('button', { name: /Start free trial/ }));
    expect(onSelectTier).toHaveBeenCalledWith(expect.objectContaining({ id: 'team' }), expect.any(String));
  });
});
