import type { BlockMeta } from '../../meta';
import type { InviteMembersDialogLabels } from './InviteMembersDialog';

export const meta: BlockMeta = {
  name: 'Invite members dialog',
  family: 'forms',
  status: 'stable',
  description:
    'Dialog to invite people by email (validated chips) with a role and an optional message; submits with a loading state. Optional labels?: Partial<InviteMembersDialogLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=invite-members-dialog--labels.',
  labels: [
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
    { key: 'emails', type: 'string', state: 'Default content and accessible names' },
    { key: 'placeholder', type: 'string', state: 'Default content and accessible names' },
    { key: 'listLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'role', type: 'string', state: 'Default content and accessible names' },
    { key: 'message', type: 'string', state: 'Default content and accessible names' },
    { key: 'messagePlaceholder', type: 'string', state: 'Default content and accessible names' },
    { key: 'emailRequired', type: 'string', state: 'Validation feedback' },
    { key: 'emailInvalid', type: '(email: string) => string', state: 'Validation feedback' },
    { key: 'fixInvalid', type: '(count: number) => string', state: 'Validation feedback' },
    { key: 'errorTitle', type: 'string', state: 'Validation feedback' },
    { key: 'fallbackError', type: 'string', state: 'Validation feedback' },
    { key: 'cancel', type: 'string', state: 'Default content and accessible names' },
    { key: 'submit', type: 'string', state: 'Default content and accessible names' },
    { key: 'submitMany', type: '(count: number) => string', state: 'Default content and accessible names' },
  ] satisfies Array<{ key: keyof InviteMembersDialogLabels; type: string; state: string }>,
  uses: ['Dialog', 'TokenInput', 'Select', 'Textarea', 'Field', 'Button', 'Alert'],
};
