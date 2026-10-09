import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Forgot password form',
  family: 'auth',
  status: 'stable',
  description: 'Email (default) or username-or-email password recovery; onSubmit receives the trimmed identifier. Supports identifier (type, autoComplete, label, help/helpId, placeholder, minLength/maxLength), messages (identifierRequired/identifierInvalid/identifierTooShort/passwordRequired), and React 19 ref.focus. The kit owns inline validation and focuses the first invalid field; consumers supply messages, not a second inline validator. Server errors use error + fieldInvalid + feedbackId; aria-describedby describes the form, while flagged inputs also retain their help and error ids. headingLevel (h1/h2/h3/null) suppresses the heading without losing the form name; aria-label/aria-labelledby override the default name. ref.focus accepts identifier. title/description and sentTitle/sentDescription configure request and sent copy; sentTitle, sentDescription, sentStatus and resendActions accept null to hide inbox copy, announcements and resend/change-identifier actions. Preview: forgot-password-form--username-or-email.',
  uses: ['Field', 'FieldLabel', 'FieldDescription', 'FieldError', 'Input', 'Button', 'Alert', 'Link'],
};
