import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsBillingPage from './Page';

describe('SettingsBillingPage', () => {
  it('renders plan, usage, payment and invoices', () => {
    render(<SettingsBillingPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scale plan' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Plan quotas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  }, 15000);

  it('switches the billing cycle', async () => {
    const onCycleChange = vi.fn();
    render(<SettingsBillingPage onCycleChange={onCycleChange} />);
    await userEvent.click(screen.getByRole('button', { name: /^Annual/ }));
    expect(onCycleChange).toHaveBeenCalledWith('annual');
    expect(screen.getByText(/Billed annually/)).toBeInTheDocument();
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsBillingPage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
