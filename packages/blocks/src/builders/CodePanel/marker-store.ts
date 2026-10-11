import type { CodeEditorProps, Monaco } from '@gntik-ai/editor';
import type { CodePanelMarker } from './markers';
import type { CodeProblem } from './fixtures';

type Editor = Parameters<NonNullable<CodeEditorProps['onMount']>>[0];
const SEVERITY = { error: 8, warning: 4, info: 2 } as const;

/** A cached external-store snapshot for Monaco's asynchronously produced diagnostics. */
export function createMarkerStore() {
  const models = new Map<string, ReturnType<Editor['getModel']>>();
  const owners = new Map<string, Set<string>>();
  const listeners = new Set<() => void>();
  let api: Monaco | null = null;
  let markers: readonly CodePanelMarker[] = [];
  let snapshot: CodeProblem[] = [];
  const refresh = () => {
    if (!api?.editor.getModelMarkers) return;
    const paths = new Map<string, string>();
    for (const [path, model] of models) if (model?.uri) paths.set(model.uri.toString(), path);
    const injectedOwners = new Set(markers.map((m) => m.owner));
    const next: CodeProblem[] = [];
    for (const marker of api.editor.getModelMarkers({})) {
      const file = paths.get(marker.resource.toString());
      if (!file || injectedOwners.has(marker.owner)) continue;
      next.push({
        id: `monaco:${marker.owner}:${file}:${marker.startLineNumber}:${marker.startColumn}:${next.length}`,
        file,
        line: marker.startLineNumber,
        column: marker.startColumn,
        message: marker.message,
        severity: marker.severity === 8 ? 'error' : marker.severity === 4 ? 'warning' : 'info',
        source: marker.source ?? marker.owner,
      });
    }
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  const clear = () => {
    if (!api?.editor.setModelMarkers) return;
    for (const [path, model] of models) {
      if (!model || model.isDisposed?.()) continue;
      for (const owner of owners.get(path) ?? []) api.editor.setModelMarkers(model, owner, []);
    }
  };
  const apply = (next: readonly CodePanelMarker[]) => {
    markers = next;
    if (!api?.editor.setModelMarkers) return;
    for (const [path, model] of models) {
      if (!model || model.isDisposed?.()) continue;
      const groups = new Map<string, CodePanelMarker[]>();
      for (const marker of markers)
        if (marker.file === path) groups.set(marker.owner, [...(groups.get(marker.owner) ?? []), marker]);
      const previous = owners.get(path) ?? new Set<string>();
      for (const owner of new Set([...previous, ...groups.keys()])) {
        api.editor.setModelMarkers(
          model,
          owner,
          (groups.get(owner) ?? []).map((marker) => ({
            severity: SEVERITY[marker.severity],
            message: marker.message,
            source: marker.source ?? owner,
            startLineNumber: marker.line,
            startColumn: marker.column ?? 1,
            endLineNumber: marker.endLine ?? marker.line,
            endColumn: marker.endColumn ?? (marker.column ?? 1) + 1,
          })),
        );
      }
      owners.set(path, new Set(groups.keys()));
    }
    refresh();
  };
  return {
    refresh,
    clear,
    apply,
    mount(path: string, editor: Editor, monaco: Monaco) {
      api = monaco;
      models.set(path, editor.getModel());
    },
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
