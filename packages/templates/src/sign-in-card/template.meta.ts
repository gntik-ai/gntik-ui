import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Sign in (card)',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: 'Centred card sign-in with default email and password, legal footer and no SSO. Supports identifier (type, autoComplete, label, help/helpId, placeholder, minLength/maxLength), messages (identifierRequired/identifierInvalid/identifierTooShort/passwordRequired), and React 19 ref.focus. The kit owns inline validation and focuses the first invalid field; consumers supply messages, not a second inline validator. Server errors use error + fieldInvalid + feedbackId; aria-describedby describes the form, while flagged inputs also retain their help and error ids. headingLevel (h1/h2/h3/null) suppresses the heading without losing the form name; aria-label/aria-labelledby override the default name. Forwards SignInForm props unchanged, including passwordHelp/passwordHelpId and ref.focus(identifier/password). Text submissions retain email and add identifier. suppressAllHeadings suppresses every internal heading. footer, sso and signUpPrompt accept replacements or null. Preview: sign-in-card--username.',
  layout: 'AuthLayout',
  blocks: ['sign-in-form'],
};
