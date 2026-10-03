import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { QuotaMeters } from './QuotaMeters';

describe('QuotaMeters', () => {
  it('renders one meter per quota with used/limit labels', async () => {
    const { container } = render(<QuotaMeters />);
    expect(screen.getAllByRole('meter')).toHaveLength(4);
    expect(screen.getByText('412,800 / 500,000 requests')).toBeInTheDocument();
    expect(screen.getByText('78.4M / 120M tokens')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches to the projection and flags the overage', async () => {
    const user = userEvent.setup();
    render(<QuotaMeters />);
    await user.click(screen.getByRole('button', { name: 'Projected' }));
    expect(screen.getByText('521,000 / 500,000 requests')).toBeInTheDocument();
    expect(screen.getByText('21,000 requests over the plan limit')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Requests' })).toHaveAttribute('data-level', 'critical');
  });
});
