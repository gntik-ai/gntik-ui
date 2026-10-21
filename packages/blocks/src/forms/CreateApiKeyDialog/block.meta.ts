import type { BlockMeta } from '../../meta';
import type { CreateApiKeyDialogLabels } from './CreateApiKeyDialog';

export const meta: BlockMeta = {
  name: 'Create API key dialog',
  family: 'forms',
  status: 'stable',
  description:
    'Two-step dialog: name, scopes and expiry, then the secret shown once in a copyable CodeBlock with a warning. Optional labels?: Partial<CreateApiKeyDialogLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=create-api-key-dialog--labels.',
  labels: [
    { key: 'title', type: 'string', state: 'Default content and accessible names' },
    { key: 'description', type: 'string', state: 'Default content and accessible names' },
    { key: 'name', type: 'string', state: 'Default content and accessible names' },
    { key: 'namePlaceholder', type: 'string', state: 'Default content and accessible names' },
    { key: 'nameRequired', type: 'string', state: 'Validation feedback' },
    { key: 'scopes', type: 'string', state: 'Default content and accessible names' },
    { key: 'scopesRequired', type: 'string', state: 'Validation feedback' },
    { key: 'expiration', type: 'string', state: 'Default content and accessible names' },
    { key: 'errorTitle', type: 'string', state: 'Validation feedback' },
    { key: 'fallbackError', type: 'string', state: 'Validation feedback' },
    { key: 'cancel', type: 'string', state: 'Default content and accessible names' },
    { key: 'submit', type: 'string', state: 'Default content and accessible names' },
    { key: 'successTitle', type: 'string', state: 'Async feedback' },
    { key: 'successDescription', type: 'string', state: 'Async feedback' },
    { key: 'warningTitle', type: 'string', state: 'Default content and accessible names' },
    { key: 'warningDescription', type: 'string', state: 'Default content and accessible names' },
    { key: 'secretLabel', type: 'string', state: 'Default content and accessible names' },
    { key: 'done', type: 'string', state: 'Async feedback' },
  ] satisfies Array<{ key: keyof CreateApiKeyDialogLabels; type: string; state: string }>,
  uses: ['Dialog', 'Field', 'Input', 'CheckboxGroup', 'Checkbox', 'Select', 'CodeBlock', 'Alert', 'Button'],
};
