import SignInCardPage, { type SignInCardPageProps } from '../Page';

/** /preview.html?kind=template&id=sign-in-card--username */
export default function Username(props: Pick<SignInCardPageProps, 'headingLevel' | 'suppressAllHeadings'>) {
  return (
    <SignInCardPage
      {...props}
      identifier={{ type: 'text', autoComplete: 'username', label: 'Username', help: 'Use your account name.', placeholder: 'Account name', minLength: 3, maxLength: 120 }}
      messages={{ identifierRequired: 'Enter your username.', identifierInvalid: 'Use at least three characters.', passwordRequired: 'Enter your password.' }}
      description="Use your account name to continue."
      footer={null}
      signUpPrompt={null}
      sso={null}
    />
  );
}
