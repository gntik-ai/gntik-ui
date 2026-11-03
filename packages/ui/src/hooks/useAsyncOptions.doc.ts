import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useAsyncOptions',
  status: 'stable',
  description:
    'Debounced, abortable option loading for comboboxes and selects. Import useAsyncOptions from @gntik-ai/ui/hooks. loadOptions(query, { signal }) returns the items for a query; the signal aborts when the query changes, enabled turns false or the component unmounts, so pass it to fetch. An empty query loads at once, other queries wait debounceMs. Items from the previous query stay while the next one loads. Without loadOptions the hook is inert.',
  signature:
    'useAsyncOptions(loadOptions, query, { debounceMs = 250, enabled = true, onResult }?): { items, loading, error, reload }',
  server:
    'Effects do not run, so it returns no items and no error; with a loader, loading is true until the first result (`Loading…` in the example). Without one it is inert.',
};
