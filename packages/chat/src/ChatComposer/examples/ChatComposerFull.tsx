import { SimpleSelect } from '@gntik-ai/ui';
import { useState } from 'react';
import { ChatComposer, type ComposerAttachment } from '../ChatComposer';

const MODELS = [
  { value: 'fast', label: 'Fast' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'deep', label: 'Deep reasoning' },
];

export default function ChatComposerFull() {
  const [model, setModel] = useState<string | null>('balanced');
  const [files, setFiles] = useState<ComposerAttachment[]>([{ id: 'f1', name: 'invoices-september.csv', size: 48_213 }]);
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="max-w-2xl">
      <ChatComposer
        maxLength={2000}
        attachments={files}
        onAttach={(picked) => setFiles((f) => [...f, ...picked.map((p, i) => ({ id: `${p.name}-${Date.now()}-${i}`, name: p.name, size: p.size }))])}
        onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
        modelPicker={<SimpleSelect aria-label="Model" size="sm" items={MODELS} value={model} onValueChange={setModel} />}
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
