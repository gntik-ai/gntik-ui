import { useRef, useState } from 'react';
import { Button, Input, ToastProvider, Toaster, useI18n } from '@gntik-ai/ui';
import {
  useAnnounce,
  useAsyncOptions,
  useFitCount,
  useToast,
  useVirtualWindow,
  type LoadOptions,
} from '@gntik-ai/ui/hooks';

const ROW = 32;
const VIEWPORT = 160;
const sizeOf = () => ROW;
const TAG_KEYS = ['design', 'frontend', 'accessibility', 'release'] as const;
const chip = 'whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-foreground';

function Actions() {
  const { t } = useI18n();
  const announce = useAnnounce();
  const toast = useToast();
  return (
    <div className="flex gap-2">
      <Button onClick={() => announce(t('hooksExample.announce.message'))}>{t('hooksExample.announce.send')}</Button>
      <Button
        onClick={() =>
          toast.add({
            title: t('hooksExample.toast.title'),
            description: t('hooksExample.toast.description'),
            tone: 'success',
          })
        }
      >
        {t('hooksExample.toast.show')}
      </Button>
    </div>
  );
}

function Search() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const load: LoadOptions<string> = async (value) =>
    ['apple', 'apricot', 'banana'].filter((name) => name.includes(value.trim().toLowerCase()));
  const { items, loading } = useAsyncOptions(load, query, { debounceMs: 150 });
  return (
    <div className="flex max-w-sm flex-col gap-2">
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
    </div>
  );
}

function Tags() {
  const { t } = useI18n();
  const tags = TAG_KEYS.map((key) => t(`hooksExample.fitCount.tag.${key}`));
  const container = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const fit = useFitCount(true, container, measure, tags.length);
  const shown = fit ?? tags.length;
  return (
    <div className="flex flex-col gap-2">
      <div ref={container} className="relative flex max-w-sm gap-2 overflow-hidden">
        {tags.slice(0, shown).map((tag) => (
          <span key={tag} className={chip}>
            {tag}
          </span>
        ))}
        <div
          ref={measure}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 flex gap-2"
        >
          {tags.map((tag) => (
            <span key={tag} className={chip}>
              {tag}
            </span>
          ))}
          <span className={chip}>{t('hooksExample.fitCount.more', { count: tags.length })}</span>
        </div>
      </div>
      <p>{t('hooksExample.fitCount.visible', { shown, total: tags.length })}</p>
    </div>
  );
}

function Rows() {
  const { t } = useI18n();
  const [scrollTop, setScrollTop] = useState(0);
  const { start, end, total } = useVirtualWindow(1000, sizeOf, scrollTop, VIEWPORT, 1);
  const rows = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={t('hooksExample.virtualWindow.list')}
      className="max-w-sm overflow-auto rounded-md border border-border bg-card focus-ring"
      style={{ height: VIEWPORT }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div className="relative" style={{ height: total }}>
        {rows.map((index) => (
          <div key={index} className="absolute inset-x-0 px-3 leading-8" style={{ top: index * ROW, height: ROW }}>
            {t('hooksExample.virtualWindow.row', { number: index + 1 })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Smoke route: the five generic kit hooks, imported from the tree-shakable `@gntik-ai/ui/hooks` subpath. */
export function Hooks() {
  return (
    <ToastProvider>
      <main className="flex flex-col gap-4 p-6 text-sm text-foreground">
        <Actions />
        <Search />
        <Tags />
        <Rows />
      </main>
      <Toaster />
    </ToastProvider>
  );
}
