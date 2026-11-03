import { useState } from 'react';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n/I18nProvider';
import { useAsyncOptions, type LoadOptions } from '../index';

const FRUIT = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Orange', 'Pear'];

// Stands in for a request: resolves later, and gives up when the query goes stale.
const loadFruit: LoadOptions<string> = (query, { signal }) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => resolve(FRUIT.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))),
      200,
    );
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

export default function AsyncOptionsExample() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const { items, loading } = useAsyncOptions(loadFruit, query, { debounceMs: 150 });
  return (
    <div className="flex max-w-sm flex-col gap-3 text-sm text-foreground">
      <Input
        aria-label={t('hooksExample.asyncOptions.label')}
        placeholder={t('hooksExample.asyncOptions.placeholder')}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p aria-live="polite">
        {loading
          ? t('hooksExample.asyncOptions.loading')
          : t('hooksExample.asyncOptions.results', { count: items.length })}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((name) => (
          <li key={name} className="rounded-md border border-border bg-card px-2 py-1">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
