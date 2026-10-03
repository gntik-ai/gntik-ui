import { SignInForm, SsoButtons, type SignInValues, type SsoProvider } from '@gntik-ai/blocks';
import { AuthLayout } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { BrandPanel, type BrandPanelCopy } from './BrandPanel';
import { signInBrand, signInSsoProviders } from './data';

export interface SignInPageProps {
  /** Heading above the form (default "Sign in to your workspace"). */
  title: ReactNode;
  /** Line under the heading (default "Use your work email to continue."). */
  description: ReactNode;
  /** Small label above the heading. */
  eyebrow: ReactNode;
  /** Signs in. A returned promise shows the loading state; a rejection's message shows in the alert. */
  onSubmit: (values: SignInValues) => void | Promise<void>;
  /** Starts single sign-on with a provider id; the button spins until the page navigates away. */
  onSso: (providerId: string) => void;
  ssoProviders: SsoProvider[];
  error: string | null;
  forgotPasswordHref: string;
  onForgotPassword: () => void;
  signUpHref: string;
  onSignUp: () => void;
  /** Brand panel copy (split layout, large screens). */
  brand: BrandPanelCopy;
  brandFooter: ReactNode;
  logo: ReactNode;
}

/** Split sign-in: AuthLayout brand panel + SignInForm with SsoButtons. */
export default function SignInPage({
  title,
  description,
  eyebrow,
  onSubmit,
  onSso,
  ssoProviders = signInSsoProviders,
  error,
  forgotPasswordHref,
  onForgotPassword,
  signUpHref,
  onSignUp,
  brand = signInBrand,
  brandFooter = signInBrand.footer,
  logo,
}: Partial<SignInPageProps>) {
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  return (
    <AuthLayout fullScreen variant="split" logo={logo} brand={<BrandPanel {...brand} />} brandFooter={brandFooter}>
      <SignInForm
        title={title}
        description={description}
        eyebrow={eyebrow}
        onSubmit={onSubmit}
        error={error}
        forgotPasswordHref={forgotPasswordHref}
        onForgotPassword={onForgotPassword}
        signUpHref={signUpHref}
        onSignUp={onSignUp}
        sso={
          <SsoButtons
            providers={ssoProviders}
            loadingId={ssoLoading}
            onSelect={(id) => {
              setSsoLoading(id);
              onSso?.(id);
            }}
          />
        }
      />
    </AuthLayout>
  );
}
