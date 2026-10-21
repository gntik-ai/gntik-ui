import type { BlockMeta } from '../../meta';
import type { ResetPasswordFormLabels } from './ResetPasswordForm';

export const meta: BlockMeta = {
  name: 'Reset password form',
  family: 'auth',
  status: 'stable',
  description:
    'New password with a strength meter and a confirmation field with mismatch validation, then a success state. Optional labels?: Partial<ResetPasswordFormLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=reset-password-form--labels.',
  labels: [
    { key: 'eyebrow', type: 'string', state: 'Default content and accessible names' },
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: '(minimum: number) => string', state: 'Default content and accessible names' },
    { key: 'newPassword', type: 'string', state: 'Default content and accessible names' },
    { key: 'confirmPassword', type: 'string', state: 'Default content and accessible names' },
    { key: 'passwordTooShort', type: '(minimum: number) => string', state: 'Validation feedback' },
    { key: 'passwordMismatch', type: 'string', state: 'Validation feedback' },
    { key: 'submit', type: 'string', state: 'Default content and accessible names' },
    { key: 'successTitle', type: 'string', state: 'Async feedback' },
    { key: 'successDescription', type: 'string', state: 'Async feedback' },
    { key: 'successStatus', type: 'string', state: 'Async feedback' },
    { key: 'continue', type: 'string', state: 'Default content and accessible names' },
    { key: 'fallbackError', type: 'string', state: 'Validation feedback' },
  ] satisfies Array<{ key: keyof ResetPasswordFormLabels; type: string; state: string }>,
  uses: ['Field', 'PasswordInput', 'Button', 'Alert'],
};
