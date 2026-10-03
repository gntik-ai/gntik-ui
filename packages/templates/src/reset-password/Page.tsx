import { ResetPasswordForm } from '@gntik-ai/blocks';
import { AuthLayout, Link } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { resetPasswordSample } from './data';

export interface ResetPasswordPageProps {
  /** Saves the new password. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit: (password: string) => void | Promise<void>;
  /** "Continue to sign in" from the success state. */
  onContinue: () => void;
  error: string | null;
  minPasswordLength: number;
  signInHref: string;
  logo: ReactNode;
}

/** Card new-password step: AuthLayout `card` + ResetPasswordForm (form → success). */
export default function ResetPasswordPage({
  onSubmit,
  onContinue,
  error,
  minPasswordLength = resetPasswordSample.minPasswordLength,
  signInHref = resetPasswordSample.signInHref,
  logo,
}: Partial<ResetPasswordPageProps>) {
  return (
    <AuthLayout
      fullScreen
      variant="card"
      logo={logo}
      skipLinkLabel="Skip to password form"
      footer={
        <>
          Remembered it? <Link href={signInHref}>Back to sign in</Link>
        </>
      }
    >
      <ResetPasswordForm onSubmit={onSubmit} onContinue={onContinue} error={error} minPasswordLength={minPasswordLength} />
    </AuthLayout>
  );
}
