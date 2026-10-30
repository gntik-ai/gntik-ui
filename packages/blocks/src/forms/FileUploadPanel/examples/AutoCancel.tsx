import { useState } from 'react';
import { Button } from '@gntik-ai/ui';
import { FileUploadPanel, type UploadItem } from '../FileUploadPanel';
import { simulateUpload } from '../fixtures';

export default function AutoCancel() {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [locked, setLocked] = useState(false);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Pick files to upload. Cancel aborts the transport; failed uploads can be retried. Preprocessing skips notes.txt,
        rejects empty files and renames .txt files to .csv.
      </p>
      <Button variant="secondary" aria-pressed={locked} onClick={() => setLocked(!locked)}>
        Keep files: {locked ? 'on' : 'off'}
      </Button>
      <FileUploadPanel
        accept=".csv,.txt"
        files={files}
        onFilesChange={setFiles}
        beforeUpload={async (file) => {
          if (file.name === 'notes.txt') return false;
          if (!file.size) throw new Error('Empty file');
          return file.name.endsWith('.txt')
            ? new File([file], file.name.replace(/\.txt$/, '.csv'), { type: 'text/csv' })
            : file;
        }}
        onUpload={async (file, onProgress, { signal, id }) => {
          // A real transport must forward signal:
          // await fetch('/api/uploads', { method: 'POST', body: file, signal });
          await simulateUpload(file, onProgress, { signal, id });
        }}
        onRemove={async () => !locked}
      />
    </div>
  );
}
