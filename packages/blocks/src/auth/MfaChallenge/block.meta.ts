import type { BlockMeta } from '../../meta';
import type { MfaChallengeLabels } from './MfaChallenge';

export const meta: BlockMeta = {
  name: 'MFA challenge',
  family: 'auth',
  status: 'stable',
  description:
    'Second-factor step with a one-time code (auto-submit), a backup-code mode and resend with a countdown. Optional labels?: Partial<MfaChallengeLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=mfa-challenge--labels.',
  labels: [
    { key: 'eyebrow', type: 'string', state: 'Default content and accessible names' },
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'backupTitle', type: 'string', state: 'Default content and accessible names' },
    { key: 'backupDescription', type: 'string', state: 'Default content and accessible names' },
    {
      key: 'destinationDescription',
      type: '(length: number, destination: string) => string',
      state: 'Default content and accessible names',
    },
    { key: 'description', type: '(length: number) => string', state: 'Default content and accessible names' },
    { key: 'formLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'codeLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'codeRequired', type: '(length: number) => string', state: 'Validation feedback' },
    { key: 'backupLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'backupPlaceholder', type: 'string', state: 'Default content and accessible names' },
    { key: 'backupHint', type: 'string', state: 'Default content and accessible names' },
    { key: 'backupRequired', type: 'string', state: 'Validation feedback' },
    { key: 'submit', type: 'string', state: 'Default content and accessible names' },
    { key: 'useCode', type: 'string', state: 'Default content and accessible names' },
    { key: 'resendIn', type: '(remaining: number) => string', state: 'Default content and accessible names' },
    { key: 'resend', type: 'string', state: 'Default content and accessible names' },
    { key: 'resent', type: 'string', state: 'Async feedback' },
    { key: 'backToSignIn', type: 'string', state: 'Default content and accessible names' },
    { key: 'fallbackError', type: 'string', state: 'Validation feedback' },
  ] satisfies Array<{ key: keyof MfaChallengeLabels; type: string; state: string }>,
  uses: ['OtpInput', 'Field', 'Input', 'Button', 'Alert'],
};
