import { render } from '@testing-library/react';
import { PlanCard, type BillingPlan } from './PlanCard';
import { withoutForcedColors } from '../../test/without-forced-colors';

const full: BillingPlan = {
  name: 'Fixture Plan',
  status: 'active',
  priceMonthly: 10,
  priceAnnual: 100,
  currency: 'EUR',
  renewsOn: '2027-01-01',
  summary: '2 seats',
  features: ['Feature A', 'Feature B'],
};

// Keep text-node spaces inline while retaining the exact rendered HTML baseline.
describe('PlanCard billing DOM baseline', () => {
  it('preserves the no-props billing header', () => {
    const { container } = render(<PlanCard />);
    expect(withoutForcedColors(container).outerHTML).toMatchSnapshot();
  });

  it('preserves the FULL billing header', () => {
    const { container } = render(<PlanCard plan={full} upgradeLabel="Upgrade" manageLabel="Manage" />);
    expect(withoutForcedColors(container).outerHTML).toMatchSnapshot();
  });
});
