import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PaymentMethodCard } from './PaymentMethodCard';

describe('PaymentMethodCard', () => {
  it('renders the masked card and expiry', async () => {
    const { container } = render(<PaymentMethodCard />);
    expect(screen.getByText(/Visa ending in/)).toHaveTextContent('Visa ending in 4242');
    expect(screen.getByText('08/28')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('shows the expiry status and fires update', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <PaymentMethodCard
        method={{ brand: 'Mastercard', last4: '0005', expMonth: 1, expYear: 2026, status: 'expired' }}
        onUpdate={onUpdate}
      />,
    );
    expect(screen.getByText('Expired')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(onUpdate).toHaveBeenCalledOnce();
  });
});
