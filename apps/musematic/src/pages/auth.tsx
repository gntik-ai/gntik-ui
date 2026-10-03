import { MfaPage, SignInPage } from '@gntik-ai/templates';
import { Logo } from '@gntik-ai/ui';
import { navigate } from '../router';

const brand = {
  eyebrow: 'AI agent platform',
  headline: 'Run fleets of agents you can trust.',
  features: ['Every run traced, span by span', 'Evaluations gate every promotion', 'Model keys, budgets and roles per workspace'],
};

export function SignIn() {
  return (
    <SignInPage
      logo={<Logo size={28} wordmark />}
      brand={brand}
      brandFooter="SSO · MFA · audited access"
      onSubmit={() => navigate('/mfa')}
      onSso={() => navigate('/mfa')}
      forgotPasswordHref="/sign-in"
      signUpHref="/sign-in"
    />
  );
}

export function Mfa() {
  return (
    <MfaPage
      logo={<Logo size={28} wordmark />}
      destination={null}
      onVerify={() => navigate('/')}
      onCancel={() => navigate('/sign-in')}
    />
  );
}
