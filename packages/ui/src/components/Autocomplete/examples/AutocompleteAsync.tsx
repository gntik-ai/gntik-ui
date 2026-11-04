import { useI18n } from '../../../i18n/I18nProvider';
import { Autocomplete } from '../Autocomplete';

const HOSTS = ['db.internal', 'db.replica', 'cache.internal', 'queue.internal', 'search.internal', 'web.internal'];

/** Stands in for `fetch('/api/hosts?q=…', { signal })`: resolves after a short delay, honours abort. */
function searchHosts(query: string, { signal }: { signal: AbortSignal }): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(HOSTS.filter((host) => host.includes(query.toLowerCase())));
    }, 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export default function AutocompleteAsync() {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-sm">
      <Autocomplete<string>
        label={t('autocomplete.examples.host')}
        placeholder={t('autocomplete.examples.hostPlaceholder')}
        loadOptions={searchHosts}
        debounceMs={250}
        name="host"
      />
      <p className="mt-2 text-[12px] text-muted-foreground">{t('autocomplete.examples.hostHint')}</p>
    </div>
  );
}
