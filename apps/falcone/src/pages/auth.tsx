import { SignInPage } from '@gntik-ai/templates';
import { Logo } from '@gntik-ai/ui';
import { navigate } from '../router';

const brand = {
  eyebrow: 'Serverless backend platform',
  headline: 'Functions, workflows and MCP for every tenant.',
  features: ['dev, staging and prod for every project', 'Bring your own LLM keys, metered per tenant', 'Quotas, real-time channels and a full audit log'],
};

export function SignIn() {
  return (
    <SignInPage
      logo={<Logo size={28} wordmark />}
      brand={brand}
      brandFooter="SSO · MFA · audited access"
      onSubmit={() => navigate('/')}
      onSso={() => navigate('/')}
      forgotPasswordHref="/sign-in"
      signUpHref="/sign-in"
    />
  );
}
