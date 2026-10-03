import { SignUpForm, SsoButtons, type SignUpValues, type SsoProvider } from '@gntik-ai/blocks';
import { AuthLayout } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { BrandPanel, type BrandPanelCopy } from '../sign-in/BrandPanel';
import { signUpBrand, signUpSsoProviders } from './data';

export interface SignUpPageProps {
  /** Creates the account. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit: (values: SignUpValues) => void | Promise<void>;
  /** Starts single sign-on with a provider id. */
  onSso: (providerId: string) => void;
  ssoProviders: SsoProvider[];
  error: string | null;
  minPasswordLength: number;
  termsHref: string;
  privacyHref: string;
  signInHref: string;
  onSignIn: () => void;
  brand: BrandPanelCopy;
  brandFooter: ReactNode;
  logo: ReactNode;
}

/** Split sign-up: AuthLayout brand panel + SignUpForm with SsoButtons. */
export default function SignUpPage({
  onSubmit,
  onSso,
  ssoProviders = signUpSsoProviders,
  error,
  minPasswordLength,
  termsHref,
  privacyHref,
  signInHref,
  onSignIn,
  brand = signUpBrand,
  brandFooter = signUpBrand.footer,
  logo,
}: Partial<SignUpPageProps>) {
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  return (
    <AuthLayout fullScreen variant="split" logo={logo} brand={<BrandPanel {...brand} />} brandFooter={brandFooter} skipLinkLabel="Skip to sign-up form">
      <SignUpForm
        onSubmit={onSubmit}
        error={error}
        minPasswordLength={minPasswordLength}
        termsHref={termsHref}
        privacyHref={privacyHref}
        signInHref={signInHref}
        onSignIn={onSignIn}
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
