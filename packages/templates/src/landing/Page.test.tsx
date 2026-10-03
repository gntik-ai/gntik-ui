import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import LandingPage from './Page';

describe('LandingPage', () => {
  it('renders the navbar, the marketing sections and the footer', { timeout: 15000 }, async () => {
    render(<LandingPage />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '#pricing');
    expect(screen.getByRole('heading', { level: 2, name: 'Simple pricing that scales with you' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('switches the billing cycle and selects a tier', { timeout: 15000 }, async () => {
    const onSelectTier = vi.fn();
    render(<LandingPage onSelectTier={onSelectTier} />);
    const pricing = screen.getByRole('region', { name: 'Simple pricing that scales with you' });
    await userEvent.click(within(pricing).getByRole('button', { name: /Annual/ }));
    await userEvent.click(within(pricing).getByRole('button', { name: /Start free trial/ }));
    expect(onSelectTier).toHaveBeenCalledWith(expect.objectContaining({ id: 'team' }), 'annual');
  });
});
