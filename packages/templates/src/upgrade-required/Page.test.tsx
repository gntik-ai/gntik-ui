import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import UpgradeRequiredPage from './Page';

describe('UpgradeRequiredPage', () => {
  it('renders the gate inside the console with the plan comparison', { timeout: 15000 }, async () => {
    render(<UpgradeRequiredPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Audit log is available on Team' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Compare plans' })).toBeInTheDocument();
    expect(screen.getByText('Your workspace is on the Starter plan')).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('starts the upgrade from a tier CTA, ignoring the current plan', { timeout: 15000 }, async () => {
    const onUpgrade = vi.fn();
    render(<UpgradeRequiredPage onUpgrade={onUpgrade} />);
    const main = screen.getByRole('main');
    await userEvent.click(within(main).getByRole('button', { name: /Current plan/ }));
    expect(onUpgrade).not.toHaveBeenCalled();
    await userEvent.click(within(main).getByRole('button', { name: /Start free trial/ }));
    expect(onUpgrade).toHaveBeenCalledWith(expect.objectContaining({ id: 'team' }), 'monthly');
  });
});
