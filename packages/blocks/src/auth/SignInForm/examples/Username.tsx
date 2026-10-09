import { SignInForm, type SignInFormProps } from '../SignInForm';

/** /preview.html?kind=block&id=sign-in-form--username */
export default function Username(props: Pick<SignInFormProps, 'headingLevel'>) {
  return (
    <SignInForm
      {...props}
      identifier={{ type: 'text', autoComplete: 'username', label: 'Username', help: 'Use your account name.', placeholder: 'Account name', minLength: 3, maxLength: 120 }}
      messages={{ identifierRequired: 'Enter your username.', identifierInvalid: 'Use at least three characters.', passwordRequired: 'Enter your password.' }}
      description="Use your account name to continue."
      sso={null}
    />
  );
}
