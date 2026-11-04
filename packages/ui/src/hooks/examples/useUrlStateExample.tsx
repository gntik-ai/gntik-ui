import { useMemo } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n/I18nProvider';
import { UrlStateProvider, useUrlState, urlParam, type UrlStateAdapter } from '../useUrlState';

const schema = { q: urlParam.string(), page: urlParam.integer(1, { min: 1, history: 'push' }) };

function SharedQuery() {
  const { t } = useI18n();
  const [values] = useUrlState(schema);
  return <output aria-label={t('hooksExample.url.shared')}>{values.q || t('hooksExample.url.empty')}</output>;
}
function Controls() {
  const { t } = useI18n();
  const [values, setValues] = useUrlState(schema);
  return (
    <div className="flex flex-col gap-3 text-sm text-foreground">
      <Input
        aria-label={t('hooksExample.url.search')}
        value={values.q}
        onChange={(event) => setValues({ q: event.target.value })}
      />
      <SharedQuery />
      <output aria-label={t('hooksExample.url.page')}>{values.page}</output>
      <div className="flex gap-2">
        <Button onClick={() => setValues((previous) => ({ page: previous.page + 1 }))}>
          {t('hooksExample.url.next')}
        </Button>
        <Button variant="secondary" onClick={() => setValues({ q: '' })}>
          {t('hooksExample.url.clear')}
        </Button>
      </div>
      <p className="text-muted-foreground">{t('hooksExample.url.hint')}</p>
    </div>
  );
}

function createMemoryAdapter(): UrlStateAdapter {
  let search = '';
  const listeners = new Set<() => void>();
  return {
    getSearch: () => search,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setSearch(next) {
      search = next;
      listeners.forEach((listener) => listener());
    },
  };
}

/** The catalog uses memory so trying the example cannot change its own route. */
export default function UrlStateExample() {
  const adapter = useMemo(() => createMemoryAdapter(), []);
  return (
    <UrlStateProvider adapter={adapter}>
      <Controls />
    </UrlStateProvider>
  );
}
