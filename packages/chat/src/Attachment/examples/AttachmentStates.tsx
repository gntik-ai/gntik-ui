import { useState } from 'react';
import { AttachmentList } from '../AttachmentList';
import type { ChatAttachment } from '../AttachmentChip';
import { PREVIEW_IMAGE as PREVIEW } from './preview';

const INITIAL: ChatAttachment[] = [
  { id: 'a', name: 'architecture-diagram.png', size: 284_311, type: 'image/png', previewUrl: PREVIEW },
  { id: 'b', name: 'invoices-september.csv', size: 48_213, type: 'text/csv', progress: 62 },
  { id: 'c', name: 'contract-draft.pdf', size: 1_904_118, type: 'application/pdf', progress: null },
  { id: 'd', name: 'release-notes.md', size: 9_042, error: 'Network error' },
];

export default function AttachmentStates() {
  const [files, setFiles] = useState(INITIAL);
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <AttachmentList
        attachments={files}
        onRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
        onRetry={(id) => setFiles((f) => f.map((x) => (x.id === id ? { ...x, error: undefined, progress: 100 } : x)))}
      />
      <AttachmentList
        label="Files in this message"
        variant="tile"
        attachments={[
          { id: 't1', name: 'screenshot.png', size: 120_400, type: 'image/png', previewUrl: PREVIEW },
          { id: 't2', name: 'logs.zip', size: 2_400_000 },
        ]}
      />
    </div>
  );
}
