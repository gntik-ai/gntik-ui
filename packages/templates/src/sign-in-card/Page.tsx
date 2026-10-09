import { SignInForm, type SignInValues, type SignInFormProps } from '@gntik-ai/blocks';
import { AuthLayout, Link } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { signInCardCopy } from './data';

export interface SignInCardPageProps extends SignInFormProps {
  onSubmit: (values: SignInValues) => void | Promise<void>;
  error: string | null;
  defaultEmail: string;
  forgotPasswordHref: string;
  onForgotPassword: () => void;
  signUpHref: string;
  onSignUp: () => void;
  /** Optional SSO area under the form; hidden by default. */
  sso: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  termsHref: string;
  privacyHref: string;
  logo: ReactNode;
  /** Replaces the legal footer; `null` hides it. */
  footer?: ReactNode;
  /** Suppresses all internal headings, including the embedded form heading. */
  suppressAllHeadings?: boolean;
}

/** Card sign-in: AuthLayout `card` + SignInForm without SSO. */
export default function SignInCardPage({
  onSubmit,
  error,
  defaultEmail,
  forgotPasswordHref,
  onForgotPassword,
  signUpHref,
  onSignUp,
  sso = null,
  eyebrow = signInCardCopy.eyebrow,
  title = signInCardCopy.title,
  description = signInCardCopy.description,
  termsHref = signInCardCopy.termsHref,
  privacyHref = signInCardCopy.privacyHref,
  logo,
  footer,
  suppressAllHeadings = false,
  headingLevel,
  ...formProps
}: Partial<SignInCardPageProps>) {
  return (
    <AuthLayout
      fullScreen
      variant="card"
      logo={logo}
      footer={
        footer === undefined ? (
          <>
            By signing in you agree to the <Link href={termsHref}>Terms</Link> and <Link href={privacyHref}>Privacy Policy</Link>.
          </>
        ) : (
          footer
        )
      }
    >
      <SignInForm
        {...formProps}
        headingLevel={suppressAllHeadings ? null : headingLevel}
        onSubmit={onSubmit}
        error={error}
        defaultEmail={defaultEmail}
        forgotPasswordHref={forgotPasswordHref}
        onForgotPassword={onForgotPassword}
        signUpHref={signUpHref}
        onSignUp={onSignUp}
        sso={sso}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
    </AuthLayout>
  );
}
