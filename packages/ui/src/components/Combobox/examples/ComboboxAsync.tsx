import { useCallback } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { matchText } from '../../../utils/match-text';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '../Combobox';

interface Member {
  value: string;
  label: string;
  email: string;
}

const DIRECTORY: Member[] = [
  { value: 'emma', label: 'Emma Crown', email: 'emma@example.com' },
  { value: 'leo', label: 'Leo Park', email: 'leo@example.com' },
  { value: 'mara', label: 'Mara Vidal', email: 'mara@example.com' },
  { value: 'noah', label: 'Noah Frey', email: 'noah@example.com' },
  { value: 'ines', label: 'Ines Roca', email: 'ines@example.com' },
  { value: 'omar', label: 'Omar Haddad', email: 'omar@example.com' },
  { value: 'yuki', label: 'Yuki Sato', email: 'yuki@example.com' },
];

/** Stands in for `fetch('/api/members?q=…', { signal })`: resolves after a short delay, honours abort. */
function searchMembers(query: string, { signal }: { signal: AbortSignal }, locale?: string): Promise<Member[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(DIRECTORY.filter((m) => matchText(`${m.label} ${m.email}`, query, { locale })));
    }, 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export default function ComboboxAsync() {
  const { locale } = useI18n();
  const loadOptions = useCallback(
    (query: string, context: { signal: AbortSignal }) => searchMembers(query, context, locale),
    [locale],
  );
  return (
    <div className="w-full max-w-sm">
      <Combobox<Member> loadOptions={loadOptions} debounceMs={250}>
        <ComboboxInput label="Assignee" placeholder="Search the directory…" showClear />
        <ComboboxContent emptyText="No members match.">
          {(m: Member) => (
            <ComboboxItem key={m.value} value={m}>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-medium">{m.label}</span>
                <span className="truncate font-mono text-[11px] text-muted-foreground">{m.email}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      <p className="mt-2 text-[12px] text-muted-foreground">Results load as you type; stale requests are cancelled.</p>
    </div>
  );
}
