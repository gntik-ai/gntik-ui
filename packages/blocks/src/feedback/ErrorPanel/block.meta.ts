import type { BlockMeta } from '../../meta';
import type { ErrorPanelLabels } from './ErrorPanel';

export const meta: BlockMeta = {
  name: 'Error panel',
  family: 'feedback',
  status: 'beta',
  description:
    'Error summary with status code, copyable request id, retry with loading state and a technical-details disclosure. Optional labels?: Partial<ErrorPanelLabels> overrides each built-in label. Explicit content props win over labels, then I18nProvider (en/es); no provider keeps English. Imported fixtures and machine data stay unchanged. See the Catalog labels live preview.',
  labels: [
    { key: 'title', type: 'string', state: 'Panel heading; explicit title prop wins, including null' },
    { key: 'message', type: 'string', state: 'Summary; explicit message prop wins, including null' },
    {
      key: 'support',
      type: 'string',
      state: 'Default secondary action; explicit secondaryAction wins, including null',
    },
    { key: 'retry', type: 'string', state: 'Retry button; retryLabel prop wins' },
    { key: 'retrying', type: 'string', state: 'Busy retry button' },
    { key: 'retryingStatus', type: 'string', state: 'Busy status announcement' },
    { key: 'requestId', type: 'string', state: 'Request ID caption' },
    { key: 'copyRequestId', type: 'string', state: 'Copy request ID button' },
    { key: 'copied', type: 'string', state: 'Copy button after copying' },
    { key: 'requestIdCopied', type: 'string', state: 'Copied status announcement' },
    { key: 'details', type: 'string', state: 'Technical details disclosure' },
  ] satisfies Array<{ key: keyof ErrorPanelLabels; type: string; state: string }>,
  uses: ['Button', 'IconButton', 'Collapsible'],
};
