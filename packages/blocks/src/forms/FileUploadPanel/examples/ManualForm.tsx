import { useState, type FormEvent } from 'react';
import { Button, Input } from '@gntik-ai/ui';
import { FileUploadPanel, type UploadItem } from '../FileUploadPanel';

/** The form owns the picked File objects and submits them with its other fields. */
export default function ManualForm() {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [submitted, setSubmitted] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    for (const item of files) if (item.status === 'pending' && item.file) data.append('files', item.file);
    // Send data with fetch('/api/collections', { method: 'POST', body: data }).
    setSubmitted(
      `${data.get('title')}: ${files
        .filter((item) => item.status === 'pending')
        .map((item) => item.file?.name)
        .join(', ')}`,
    );
  };
  return (
    <form aria-label="Create collection" onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm text-foreground">
        Collection title
        <Input name="title" defaultValue="Documents" required />
      </label>
      <FileUploadPanel files={files} onFilesChange={setFiles} uploadMode="manual" />
      <Button type="submit" disabled={!files.some((item) => item.status === 'pending')}>
        Create collection
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {submitted}
      </p>
    </form>
  );
}
