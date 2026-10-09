import { ForgotPasswordForm, type ForgotPasswordFormProps } from '@gntik-ai/blocks';
import { AuthLayout, Link } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { forgotPasswordSample } from './data';

export interface ForgotPasswordPageProps extends ForgotPasswordFormProps {
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
  /** Replaces the support footer; `null` hides it. */
  footer?: ReactNode;
  /** Suppresses all internal headings in both request and sent states. */
  suppressAllHeadings?: boolean;
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
  footer,
  suppressAllHeadings = false,
  headingLevel,
  ...formProps
}: Partial<ForgotPasswordPageProps>) {
  return (
    <AuthLayout
      fullScreen
      variant="card"
      logo={logo}
      skipLinkLabel="Skip to reset form"
      footer={
        footer === undefined ? (
          <>
            Lost access to your email? <Link href={supportHref}>Contact support</Link>
          </>
        ) : (
          footer
        )
      }
    >
      <ForgotPasswordForm
        {...formProps}
        headingLevel={suppressAllHeadings ? null : headingLevel}
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
