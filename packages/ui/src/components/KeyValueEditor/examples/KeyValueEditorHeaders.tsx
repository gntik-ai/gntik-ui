import { createKeyValueRow } from '../key-value';
import { KeyValueEditor } from '../KeyValueEditor';

/** Uncontrolled HTTP headers: any key pattern, case-insensitive duplicates, values required. */
export default function KeyValueEditorHeaders() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <KeyValueEditor
        aria-label="Request headers"
        size="sm"
        keyPattern={/^[A-Za-z0-9-]+$/}
        caseInsensitive
        requireValue
        allowSecrets={false}
        allowPaste={false}
        keyPlaceholder="Header"
        valuePlaceholder="Value"
        defaultValue={[createKeyValueRow('Accept', 'application/json'), createKeyValueRow('accept', '')]}
      />
      <KeyValueEditor aria-label="Labels (read-only)" readOnly allowExport={false} defaultValue={[createKeyValueRow('team', 'platform'), createKeyValueRow('tier', 'gold')]} keyPattern={null} />
    </div>
  );
}
