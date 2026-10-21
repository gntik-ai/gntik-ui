import type { BlockMeta } from '../../meta';
import type { SignInFormLabels } from './SignInForm';

export const meta: BlockMeta = {
  name: 'Sign-in form',
  family: 'auth',
  status: 'stable',
  description:
    'Email (default) or text identifier and password sign-in. Supports identifier (type, autoComplete, label, help/helpId, placeholder, minLength/maxLength), messages (identifierRequired/identifierInvalid/identifierTooShort/passwordRequired), and React 19 ref.focus. The kit owns inline validation and focuses the first invalid field; consumers supply messages, not a second inline validator. Server errors use error + fieldInvalid + feedbackId; aria-describedby describes the form, while flagged inputs also retain their help and error ids. headingLevel (h1/h2/h3/null) suppresses the heading without losing the form name; aria-label/aria-labelledby override the default name. passwordHelp/passwordHelpId describe the password. Text submissions add values.identifier and retain values.email; email-mode payloads are unchanged. sso and signUpPrompt accept replacements or null. Preview: sign-in-form--username. Optional labels?: Partial<SignInFormLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=sign-in-form--labels.',
  labels: [
    { key: 'eyebrow', type: 'string', state: 'Default content and accessible names' },
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
    { key: 'formLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'identifierLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'identifierPlaceholder', type: 'string', state: 'Default content and accessible names' },
    { key: 'password', type: 'string', state: 'Default content and accessible names' },
    { key: 'forgotPassword', type: 'string', state: 'Default content and accessible names' },
    { key: 'passwordRequired', type: 'string', state: 'Validation feedback' },
    { key: 'remember', type: 'string', state: 'Default content and accessible names' },
    { key: 'submit', type: 'string', state: 'Default content and accessible names' },
    { key: 'divider', type: 'string', state: 'Default content and accessible names' },
    { key: 'signUpPrompt', type: 'string', state: 'Default content and accessible names' },
    { key: 'signUp', type: 'string', state: 'Default content and accessible names' },
    { key: 'fallbackError', type: 'string', state: 'Validation feedback' },
    { key: 'identifierRequired', type: 'string', state: 'Validation feedback' },
    { key: 'identifierInvalid', type: 'string', state: 'Validation feedback' },
    { key: 'identifierTooShort', type: 'string', state: 'Validation feedback' },
  ] satisfies Array<{ key: keyof SignInFormLabels; type: string; state: string }>,
  uses: [
    'Field',
    'FieldLabel',
    'FieldDescription',
    'FieldError',
    'Input',
    'PasswordInput',
    'Checkbox',
    'Button',
    'Alert',
    'Link',
    'SsoButtons',
  ],
};
