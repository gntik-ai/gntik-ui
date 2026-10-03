import type { PaymentMethod } from './PaymentMethodCard';

/** Sample default payment method. */
export const samplePaymentMethod: PaymentMethod = {
  brand: 'Visa',
  last4: '4242',
  expMonth: 8,
  expYear: 2028,
  holder: 'Alex Morgan',
  isDefault: true,
  status: 'valid',
};
