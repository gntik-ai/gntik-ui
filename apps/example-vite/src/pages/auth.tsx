import { ForgotPasswordPage, SignInPage, SignUpPage } from '@gntik-ai/templates';
import { authBrand } from '../data/auth';
import { supportHref } from '../data/status';
import { navigate } from '../router';

/** Demo auth: any credentials "work" after a short delay. Replace with your auth calls. */
const fakeRequest = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

export function SignIn() {
  return (
    <SignInPage
      brand={authBrand}
      brandFooter={authBrand.footer}
      onSubmit={async () => {
        await fakeRequest();
        navigate('/');
      }}
      onSso={() => setTimeout(() => navigate('/'), 600)}
      forgotPasswordHref="/forgot-password"
      signUpHref="/sign-up"
    />
  );
}

export function SignUp() {
  return (
    <SignUpPage
      brand={authBrand}
      brandFooter={authBrand.footer}
      onSubmit={async () => {
        await fakeRequest();
        navigate('/onboarding');
      }}
      onSso={() => setTimeout(() => navigate('/onboarding'), 600)}
      termsHref="/terms"
      privacyHref="/privacy"
      signInHref="/sign-in"
    />
  );
}

export function ForgotPassword() {
  return <ForgotPasswordPage onSubmit={fakeRequest} signInHref="/sign-in" supportHref={supportHref} />;
}
