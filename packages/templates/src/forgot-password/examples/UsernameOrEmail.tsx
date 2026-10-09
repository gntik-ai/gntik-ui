import ForgotPasswordPage, { type ForgotPasswordPageProps } from '../Page';

/** /preview.html?kind=template&id=forgot-password--username-or-email */
export default function UsernameOrEmail(props: Pick<ForgotPasswordPageProps, 'headingLevel' | 'suppressAllHeadings'>) {
  return (
    <ForgotPasswordPage
      {...props}
      identifier={{
        type: 'text',
        autoComplete: 'username',
        label: 'Username or email',
        help: 'Use your account name or email address.',
        placeholder: 'Account name or email',
        maxLength: 255,
      }}
      messages={{ identifierRequired: 'Enter your username or email.' }}
      description="Enter your account name or email to request recovery instructions."
      sentTitle="Request received"
      sentDescription="If the account is eligible, you will receive recovery instructions."
      sentStatus="Recovery request received."
      resendActions={null}
      footer={null}
    />
  );
}
