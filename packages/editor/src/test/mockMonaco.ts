import { vi } from 'vitest';
import type { Monaco, MonacoLoader } from '../loader';

type Listener = (event: unknown) => void;

/** Minimal text model with change listeners. */
export function fakeModel(initial: string) {
  let text = initial;
  const listeners = new Set<Listener>();
  return {
    getValue: () => text,
    setValue: vi.fn((next: string) => {
      text = next;
      listeners.forEach((l) => l({ changes: [] }));
    }),
    onDidChangeContent: (l: Listener) => {
      listeners.add(l);
      return { dispose: () => listeners.delete(l) };
    },
    dispose: vi.fn(),
    /** Simulates a user edit. */
    type(next: string) {
      text = next;
      listeners.forEach((l) => l({ changes: [] }));
    },
  };
}
export type FakeModel = ReturnType<typeof fakeModel>;

export function createMockMonaco() {
  const codeEditors: Array<ReturnType<typeof fakeCodeEditor>> = [];
  const diffEditors: Array<ReturnType<typeof fakeDiffEditor>> = [];

  function fakeCodeEditor(value: string) {
    const model = fakeModel(value);
    return {
      model,
      getModel: () => model,
      getValue: () => model.getValue(),
      setValue: (v: string) => model.setValue(v),
      onDidChangeModelContent: (l: Listener) => model.onDidChangeContent(l),
      updateOptions: vi.fn(),
      layout: vi.fn(),
      dispose: vi.fn(),
    };
  }
  function fakeDiffEditor() {
    let models: { original: FakeModel; modified: FakeModel } | null = null;
    return {
      setModel: vi.fn((m: { original: FakeModel; modified: FakeModel }) => {
        models = m;
      }),
      getModel: () => models,
      updateOptions: vi.fn(),
      layout: vi.fn(),
      dispose: vi.fn(),
    };
  }

  const editorApi = {
    defineTheme: vi.fn(),
    setTheme: vi.fn(),
    setModelLanguage: vi.fn(),
    remeasureFonts: vi.fn(),
    createModel: vi.fn((value: string) => fakeModel(value)),
    create: vi.fn((_el: HTMLElement, opts: { value?: string }) => {
      const ed = fakeCodeEditor(opts.value ?? '');
      codeEditors.push(ed);
      return ed;
    }),
    createDiffEditor: vi.fn(() => {
      const ed = fakeDiffEditor();
      diffEditors.push(ed);
      return ed;
    }),
  };

  const monaco = { editor: editorApi } as unknown as Monaco;
  const loader: MonacoLoader = () => Promise.resolve(monaco);
  return { monaco, editorApi, loader, codeEditors, diffEditors };
}
