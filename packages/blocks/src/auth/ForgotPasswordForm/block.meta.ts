import type { BlockMeta } from '../../meta';
import type { ForgotPasswordFormLabels } from './ForgotPasswordForm';

export const meta: BlockMeta = {
  name: 'Forgot password form',
  family: 'auth',
  status: 'stable',
  description:
    'Email (default) or username-or-email password recovery; onSubmit receives the trimmed identifier. Supports identifier (type, autoComplete, label, help/helpId, placeholder, minLength/maxLength), messages (identifierRequired/identifierInvalid/identifierTooShort/passwordRequired), and React 19 ref.focus. The kit owns inline validation and focuses the first invalid field; consumers supply messages, not a second inline validator. Server errors use error + fieldInvalid + feedbackId; aria-describedby describes the form, while flagged inputs also retain their help and error ids. headingLevel (h1/h2/h3/null) suppresses the heading without losing the form name; aria-label/aria-labelledby override the default name. ref.focus accepts identifier. title/description and sentTitle/sentDescription configure request and sent copy; sentTitle, sentDescription, sentStatus and resendActions accept null to hide inbox copy, announcements and resend/change-identifier actions. Preview: forgot-password-form--username-or-email. Optional labels?: Partial<ForgotPasswordFormLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=forgot-password-form--labels.',
  labels: [
    { key: 'formLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'eyebrow', type: 'string', state: 'Default content and accessible names' },
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
    { key: 'sentTitle', type: 'string', state: 'Async feedback' },
    { key: 'sentDescription', type: '(email: string) => ReactNode', state: 'Async feedback' },
    { key: 'addressFallback', type: 'string', state: 'Async feedback' },
    { key: 'sentStatus', type: 'string', state: 'Async feedback' },
    { key: 'fallbackError', type: 'string', state: 'Validation feedback' },
    { key: 'backToSignIn', type: 'string', state: 'Default content and accessible names' },
    { key: 'resend', type: 'string', state: 'Default content and accessible names' },
    { key: 'changeEmail', type: 'string', state: 'Default content and accessible names' },
    { key: 'identifierLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'identifierPlaceholder', type: 'string', state: 'Default content and accessible names' },
    { key: 'submit', type: 'string', state: 'Default content and accessible names' },
    { key: 'identifierRequired', type: 'string', state: 'Validation feedback' },
    { key: 'identifierInvalid', type: 'string', state: 'Validation feedback' },
    { key: 'identifierTooShort', type: 'string', state: 'Validation feedback' },
  ] satisfies Array<{ key: keyof ForgotPasswordFormLabels; type: string; state: string }>,
  uses: ['Field', 'FieldLabel', 'FieldDescription', 'FieldError', 'Input', 'Button', 'Alert', 'Link'],
};
