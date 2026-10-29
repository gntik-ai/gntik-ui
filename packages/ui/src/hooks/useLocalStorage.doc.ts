import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'Storage state',
  group: 'Layout',
  status: 'stable',
  description:
    'Import useLocalStorage, useSessionStorage, readLocalStorageValue and UseStorageOptions from @gntik-ai/ui. The hooks return [value, setValue, remove]. setValue accepts a value or updater; remove deletes the key and restores the default. JSON codecs are the default; pair serialize and deserialize for custom formats, and use validate to reject incompatible data. Invalid data is left untouched. Storage errors call onError, and failed writes keep updates in memory. Hooks sharing a key sync within the document. localStorage also follows other tabs and clear events unless sync: false; sessionStorage only syncs within this document. SSR and initial hydration use the default without accessing storage, then restore the stored value, so persisted layouts may briefly show their defaults. Client-only renders read immediately. Values keep their identity until the raw text changes; keep codecs and defaults consistent for a key. An undefined key keeps state in memory. readLocalStorageValue reads once outside React with the same fallback and validation rules. Use prefixed keys such as app:area:name, and never share one key between incompatible types. Theme persistence is separate.',
};
