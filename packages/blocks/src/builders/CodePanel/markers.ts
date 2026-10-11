import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CodeEditorProps, Monaco } from '@gntik-ai/editor';
import type { CodeProblem } from './fixtures';
import { createMarkerStore } from './marker-store';

/** Consumer line marker. Use a distinct owner for each external diagnostics service. */
export interface CodePanelMarker extends CodeProblem {
  owner: string;
  endLine?: number;
  endColumn?: number;
}

export type MonacoReady = (monaco: Monaco) => void | (() => void);
type Editor = Parameters<NonNullable<CodeEditorProps['onMount']>>[0];
export const NO_MARKERS: readonly CodePanelMarker[] = [];

/** Observe Monaco's public marker API; schemas and their workers remain consumer-owned. */
export function usePanelMarkers(
  markers: readonly CodePanelMarker[],
  onReady: MonacoReady | undefined,
  enabled: boolean,
) {
  const [store] = useState(createMarkerStore);
  const problems = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const [revision, setRevision] = useState(0);
  const ready = useRef(onReady);
  useLayoutEffect(() => {
    ready.current = onReady;
  });
  useEffect(() => {
    if (!monaco || !enabled) return;
    const subscription = monaco.editor.onDidChangeMarkers?.(store.refresh);
    const cleanup = ready.current?.(monaco);
    store.refresh();
    return () => {
      subscription?.dispose();
      cleanup?.();
      store.clear();
    };
  }, [monaco, store, enabled]);
  useEffect(() => {
    if (enabled) store.apply(markers);
  }, [store, markers, monaco, revision, enabled]);
  const mount = (path: string, editor: Editor, api: Monaco) => {
    store.mount(path, editor, api);
    setMonaco(api);
    setRevision((v) => v + 1);
  };
  return { problems: enabled ? problems : [], mount };
}

export function useValidity(errors: number, onChange: ((valid: boolean) => void) | undefined) {
  const wasValid = useRef(true);
  useEffect(() => {
    const valid = errors === 0;
    if (wasValid.current !== valid) {
      wasValid.current = valid;
      onChange?.(valid);
    }
  }, [errors, onChange]);
}
