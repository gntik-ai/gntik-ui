import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Sign-up form',
  family: 'auth',
  status: 'stable',
  description:
    'Account creation with default name/email fields or ordered text/email fields (values.fields), a password strength meter and required consent (terms=false opts out). minPasswordLength defaults to 8 and drives length validation and the insufficient-length meter; optional passwordHelp can receive the minimum. Configured fields support help, required, autoComplete and validation messages, with a linked validation summary on invalid submit. policyLoading renders skeletons without a form; unavailable replaces the form with consumer title, message and optional action. loading remains submitting; error is form-level feedback. Examples: custom-fields, no-terms, unavailable, loading, submitting and error.',
  uses: [
    'Field',
    'Input',
    'PasswordInput',
    'Checkbox',
    'Button',
    'Alert',
    'Link',
    'SsoButtons',
    'Skeleton',
    'FieldDescription',
    'ValidationSummary',
  ],
};
