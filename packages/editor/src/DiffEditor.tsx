import { useEffect, useRef, useLayoutEffect } from 'react';
import type { editor } from 'monaco-editor';
import { EditorFrame } from './EditorFrame';
import { BASE_OPTIONS, kickLayout, loadMonaco, useBrandTheme, useMonaco, type Monaco, type MonacoLoader } from './loader';
import { brandThemeFor } from './theme';

export interface DiffEditorProps {
  /** Left-hand (before) text. */
  original: string;
  /** Right-hand (after) text. */
  modified: string;
  /** Monaco language id for both sides. */
  language?: string;
  /** Read-only by default; set false to let users edit the modified side. */
  readOnly?: boolean;
  /** Side by side (default) or inline. */
  sideBySide?: boolean;
  height?: number | string;
  /** Accessible name; the sides are announced as "<label>, original" / "<label>, modified". */
  'aria-label'?: string;
  /** Called with the modified text when the user edits it (requires readOnly={false}). */
  onChange?: (modified: string) => void;
  /** Extra Monaco diff options, merged over the brand defaults. */
  options?: editor.IStandaloneDiffEditorConstructionOptions;
  className?: string;
  loader?: MonacoLoader;
  onMount?: (instance: editor.IStandaloneDiffEditor, monaco: Monaco) => void;
}

/** Monaco diff editor themed by the brand tokens; loads Monaco lazily. */
export function DiffEditor({
  original,
  modified,
  language = 'plaintext',
  readOnly = true,
  sideBySide = true,
  height = 320,
  'aria-label': ariaLabel = 'Diff editor',
  onChange,
  options,
  className,
  loader = loadMonaco,
  onMount,
}: DiffEditorProps) {
  const state = useMonaco(loader);
  const monaco = state.monaco;
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<editor.IStandaloneDiffEditor | null>(null);
  const syncing = useRef(false);
  const latest = useRef({ original, modified, language, readOnly, sideBySide, ariaLabel, options, onChange, onMount });
  useLayoutEffect(() => {
    latest.current = { original, modified, language, readOnly, sideBySide, ariaLabel, options, onChange, onMount };
  });

  useBrandTheme(monaco);

  useEffect(() => {
    if (!monaco || !host.current) return undefined;
    const p = latest.current;
    const ed = monaco.editor.createDiffEditor(host.current, {
      ...BASE_OPTIONS,
      ignoreTrimWhitespace: false,
      renderOverviewRuler: false,
      renderIndicators: true,
      renderMarginRevertIcon: false,
      useInlineViewWhenSpaceIsLimited: false,
      ...p.options,
      readOnly: p.readOnly,
      renderSideBySide: p.sideBySide,
      originalAriaLabel: `${p.ariaLabel}, original`,
      modifiedAriaLabel: `${p.ariaLabel}, modified`,
      theme: brandThemeFor(),
    });
    const originalModel = monaco.editor.createModel(p.original, p.language);
    const modifiedModel = monaco.editor.createModel(p.modified, p.language);
    ed.setModel({ original: originalModel, modified: modifiedModel });
    instance.current = ed;
    const sub = modifiedModel.onDidChangeContent(() => {
      if (!syncing.current) latest.current.onChange?.(modifiedModel.getValue());
    });
    p.onMount?.(ed, monaco);
    const fit = () => {
      const el = host.current;
      if (el) ed.layout({ width: el.clientWidth, height: el.clientHeight });
    };
    const stopLayout = kickLayout(fit);
    return () => {
      stopLayout();
      sub.dispose();
      ed.dispose();
      originalModel.dispose();
      modifiedModel.dispose();
      instance.current = null;
    };
  }, [monaco]);

  useEffect(() => {
    const model = instance.current?.getModel();
    if (!model) return;
    syncing.current = true;
    try {
      if (model.original.getValue() !== original) model.original.setValue(original);
      if (model.modified.getValue() !== modified) model.modified.setValue(modified);
    } finally {
      syncing.current = false;
    }
  }, [original, modified, monaco]);

  useEffect(() => {
    const model = instance.current?.getModel();
    if (!monaco || !model) return;
    monaco.editor.setModelLanguage(model.original, language);
    monaco.editor.setModelLanguage(model.modified, language);
  }, [language, monaco]);

  useEffect(() => {
    instance.current?.updateOptions({ ...options, readOnly, renderSideBySide: sideBySide });
  }, [options, readOnly, sideBySide, monaco]);

  return <EditorFrame state={state} height={height} label="diff editor" className={className} hostRef={host} />;
}
