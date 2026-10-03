import { useState } from 'react';
import { createKeyValueRow, type KeyValueRow } from '../key-value';
import { KeyValueEditor } from '../KeyValueEditor';

const initial: KeyValueRow[] = [
  createKeyValueRow('API_URL', 'https://api.example.com'),
  createKeyValueRow('LOG_LEVEL', 'info'),
  createKeyValueRow('DATABASE_PASSWORD', 'change-me-in-production', true),
];

/** Controlled: the parent keeps the rows and the validity (e.g. to disable Save). */
export default function KeyValueEditorEnv() {
  const [rows, setRows] = useState(initial);
  const [valid, setValid] = useState(true);
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <KeyValueEditor aria-label="Environment variables" value={rows} onChange={setRows} onValidityChange={(ok) => setValid(ok)} />
      <p className="text-[12.5px] text-muted-foreground">
        {rows.filter((r) => r.key).length} variables · {valid ? 'ready to save' : 'fix the highlighted rows to save'}
      </p>
    </div>
  );
}
