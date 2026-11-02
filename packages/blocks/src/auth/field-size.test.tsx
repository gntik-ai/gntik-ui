import { renderToStaticMarkup } from 'react-dom/server';
import { SignInForm } from './SignInForm/SignInForm';
import { SignUpForm } from './SignUpForm/SignUpForm';
import { ResetPasswordForm } from './ResetPasswordForm/ResetPasswordForm';
import { ForgotPasswordForm } from './ForgotPasswordForm/ForgotPasswordForm';
import { MfaChallenge } from './MfaChallenge/MfaChallenge';

// Captured before adding fieldSize: default auth markup must remain identical.
describe('auth default markup', () => {
  it.each([
    ['SignInForm', SignInForm],
    ['SignUpForm', SignUpForm],
    ['ResetPasswordForm', ResetPasswordForm],
    ['ForgotPasswordForm', ForgotPasswordForm],
    ['MfaChallenge', MfaChallenge],
  ] as const)('%s retains its default markup', (_name, Form) => {
    const markup = renderToStaticMarkup(<Form />);
    expect(markup).toMatchSnapshot();
    expect(renderToStaticMarkup(<Form fieldSize="auto" />)).toBe(markup);
  });
});
