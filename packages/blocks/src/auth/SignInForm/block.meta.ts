import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Sign-in form',
  family: 'auth',
  status: 'stable',
  description: 'Email (default) or text identifier and password sign-in. Supports identifier (type, autoComplete, label, help/helpId, placeholder, minLength/maxLength), messages (identifierRequired/identifierInvalid/identifierTooShort/passwordRequired), and React 19 ref.focus. The kit owns inline validation and focuses the first invalid field; consumers supply messages, not a second inline validator. Server errors use error + fieldInvalid + feedbackId; aria-describedby describes the form, while flagged inputs also retain their help and error ids. headingLevel (h1/h2/h3/null) suppresses the heading without losing the form name; aria-label/aria-labelledby override the default name. passwordHelp/passwordHelpId describe the password. Text submissions add values.identifier and retain values.email; email-mode payloads are unchanged. sso and signUpPrompt accept replacements or null. Preview: sign-in-form--username.',
  uses: ['Field', 'FieldLabel', 'FieldDescription', 'FieldError', 'Input', 'PasswordInput', 'Checkbox', 'Button', 'Alert', 'Link', 'SsoButtons'],
};
