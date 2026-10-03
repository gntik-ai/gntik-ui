import { ForgotPasswordForm } from '@gntik-ai/blocks';
import { AuthLayout, Link } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { forgotPasswordSample } from './data';

export interface ForgotPasswordPageProps {
  /** Requests the reset link. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit: (email: string) => void | Promise<void>;
  error: string | null;
  defaultEmail: string;
  /** Start on the "sent" step. */
  defaultSent: boolean;
  signInHref: string;
  onBackToSignIn: () => void;
  supportHref: string;
  logo: ReactNode;
}

/** Card password recovery: AuthLayout `card` + ForgotPasswordForm (request → sent). */
export default function ForgotPasswordPage({
  onSubmit,
  error,
  defaultEmail,
  defaultSent,
  signInHref = forgotPasswordSample.signInHref,
  onBackToSignIn,
  supportHref = forgotPasswordSample.supportHref,
  logo,
}: Partial<ForgotPasswordPageProps>) {
  return (
    <AuthLayout
      fullScreen
      variant="card"
      logo={logo}
      skipLinkLabel="Skip to reset form"
      footer={
        <>
          Lost access to your email? <Link href={supportHref}>Contact support</Link>
        </>
      }
    >
      <ForgotPasswordForm
        onSubmit={onSubmit}
        error={error}
        defaultEmail={defaultEmail}
        defaultSent={defaultSent}
        signInHref={signInHref}
        onBackToSignIn={onBackToSignIn}
      />
    </AuthLayout>
  );
}
