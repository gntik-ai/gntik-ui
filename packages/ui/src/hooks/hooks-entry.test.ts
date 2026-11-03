import { readdirSync } from 'node:fs';
import * as root from '../index';
import type { HookDoc } from '../doc';
import { documentedHooks, isHookName, undocumentedHooks } from '../test/hook-docs';
import * as hooks from './index';

const docFiles = readdirSync(__dirname).filter((file) => file.endsWith('.doc.ts'));
const docs = await Promise.all(docFiles.map(async (file) => ((await import(`./${file}`)) as { doc: HookDoc }).doc));

// Every hook and helper the root exported before the entry existed (8dbf90e).
const BEFORE_ENTRY = [
  'useClipboard',
  'useLocalStorage',
  'useSessionStorage',
  'readLocalStorageValue',
  'getOs',
  'useOs',
  'useHotkeys',
  'useRegisteredHotkeys',
  'setCharacterHotkeysEnabled',
  'useMediaQuery',
  'useReducedMotion',
  'usePrefersReducedMotion',
  'useBreakpoint',
  'useBreakpointValue',
];
const GENERIC = ['useAnnounce', 'useToast', 'useAsyncOptions', 'useFitCount', 'useVirtualWindow'];

describe('hooks entry', () => {
  it.each([...BEFORE_ENTRY, ...GENERIC])('exports %s from the entry and the root, as the same function', (name) => {
    const fromEntry = (hooks as Record<string, unknown>)[name];
    expect(typeof fromEntry).toBe('function');
    expect((root as Record<string, unknown>)[name]).toBe(fromEntry);
  });

  it('keeps every name the entry exports available from the root', () => {
    const missing = Object.keys(hooks).filter((name) => !(name in root));
    expect(missing).toEqual([]);
  });
});

describe('hook docs', () => {
  it('document every hook the entry exports', () => {
    expect(undocumentedHooks(Object.keys(hooks), docs)).toEqual([]);
  });

  it('name the hook that has no doc', () => {
    const withoutUseToast = docs.filter((doc) => doc.name !== 'useToast');
    expect(undocumentedHooks(Object.keys(hooks), withoutUseToast)).toEqual(['useToast']);
  });

  it('only document hooks the entry exports', () => {
    const exported = new Set(Object.keys(hooks));
    expect([...documentedHooks(docs)].filter((name) => !exported.has(name))).toEqual([]);
  });

  it('give each doc a signature and a server behaviour', () => {
    for (const doc of docs) {
      expect(isHookName(doc.name), doc.name).toBe(true);
      expect(doc.signature.trim(), doc.name).not.toBe('');
      expect(doc.server.trim(), doc.name).not.toBe('');
    }
  });
});
