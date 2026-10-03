import { useEffect, useRef, useState } from 'react';
import { ModelPicker, DEMO_MODELS } from '../../ModelPicker';
import { ChatComposer, type ComposerAttachment } from '../ChatComposer';

let seq = 0;

export default function ChatComposerFull() {
  const [model, setModel] = useState<string | null>('balanced');
  const [files, setFiles] = useState<ComposerAttachment[]>([
    { id: 'f1', name: 'invoices-september.csv', size: 48_213, type: 'text/csv' },
    { id: 'f2', name: 'release-notes.md', size: 9_042, error: 'Network error' },
  ]);
  const [sent, setSent] = useState<string[]>([]);
  const timers = useRef<Array<ReturnType<typeof setInterval>>>([]);
  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearInterval);
      urls.current.forEach((u) => URL.revokeObjectURL?.(u));
    },
    [],
  );

  // Mock upload: progress ticks to 100.
  const upload = (id: string) => {
    const timer = setInterval(() => {
      setFiles((all) =>
        all.map((f) => {
          if (f.id !== id) return f;
          const progress = Math.min(100, (f.progress ?? 0) + 20);
          if (progress >= 100) clearInterval(timer);
          return { ...f, progress };
        }),
      );
    }, 300);
    timers.current.push(timer);
  };

  const attach = (picked: File[]) => {
    const added = picked.map((p) => {
      const id = `file-${++seq}`;
      const previewUrl = p.type.startsWith('image/') && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(p) : undefined;
      if (previewUrl) urls.current.push(previewUrl);
      return { id, name: p.name, size: p.size, type: p.type, previewUrl, progress: 0 };
    });
    setFiles((f) => [...f, ...added]);
    added.forEach((a) => upload(a.id));
  };

  return (
    <div className="max-w-2xl">
      <ChatComposer
        maxLength={2000}
        attachments={files}
        accept=".pdf,.csv,.md,.txt,image/*"
        maxSize={10 * 1024 * 1024}
        maxFiles={5}
        onAttach={attach}
        onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
        onRetryAttachment={(id) => {
          setFiles((f) => f.map((x) => (x.id === id ? { ...x, error: undefined, progress: 0 } : x)));
          upload(id);
        }}
        modelPicker={<ModelPicker compact models={DEMO_MODELS} value={model} onValueChange={setModel} />}
        onSubmit={(text) => {
          setSent((s) => [text, ...s].slice(0, 3));
          setFiles([]);
        }}
      />
      {sent.length > 0 && (
        <ul aria-label="Sent messages" className="mt-3 space-y-1 text-[12.5px] text-muted-foreground">
          {sent.map((t, i) => (
            <li key={i}>Sent: {t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
