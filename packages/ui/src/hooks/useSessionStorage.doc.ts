import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useSessionStorage',
  status: 'stable',
  description:
    'useSessionStorage(key, defaultValue, options?) is useLocalStorage backed by sessionStorage: it returns [value, setValue, remove], accepts the same codecs, validate and onError options, and keeps the state of one tab. Import useSessionStorage from @gntik-ai/ui/hooks. Hooks sharing a key sync within the document; other tabs have their own session, so nothing follows across tabs. Use prefixed keys such as app:area:name. An undefined key keeps state in memory.',
  signature: 'useSessionStorage<T>(key, defaultValue, options?): [value, setValue, remove]',
  server:
    'Returns the default value (`Visits in this tab: 0` in the example) without reading storage, then restores the stored value after hydration.',
};
