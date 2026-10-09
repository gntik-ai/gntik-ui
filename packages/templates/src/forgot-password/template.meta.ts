import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Forgot password',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Centred card recovery with default email, inbox feedback and resend. Supports identifier (type, autoComplete, label, help/helpId, placeholder, minLength/maxLength), messages (identifierRequired/identifierInvalid/identifierTooShort/passwordRequired), and React 19 ref.focus. The kit owns inline validation and focuses the first invalid field; consumers supply messages, not a second inline validator. Server errors use error + fieldInvalid + feedbackId; aria-describedby describes the form, while flagged inputs also retain their help and error ids. headingLevel (h1/h2/h3/null) suppresses the heading without losing the form name; aria-label/aria-labelledby override the default name. Forwards ForgotPasswordForm props unchanged, including ref.focus(identifier), title/description, sentTitle/sentDescription, sentStatus and resendActions (null hides sent copy or actions). suppressAllHeadings suppresses headings in request and sent states. footer accepts replacement content or null. Preview: forgot-password--username-or-email.',
  layout: 'AuthLayout',
  blocks: ['forgot-password-form'],
};
