import { Link } from '@gntik-ai/ui';
import { SignUpForm } from '../SignUpForm';

/** No account creation form or submit control while self-service is unavailable. */
export default function Unavailable() {
  return (
    <SignUpForm
      unavailable={{
        title: 'Registration unavailable',
        message: 'Contact your administrator to request an account.',
        action: <Link href="mailto:admin@example.com">Request access</Link>,
      }}
    />
  );
}
