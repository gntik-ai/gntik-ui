import { useEffect, useRef, useLayoutEffect } from 'react';
import type { editor } from 'monaco-editor';
import { EditorFrame } from './EditorFrame';
import { BASE_OPTIONS, kickLayout, loadMonaco, useBrandTheme, useMonaco, type Monaco, type MonacoLoader } from './loader';
import { brandThemeFor } from './theme';

export interface CodeEditorProps {
  /** Controlled text. When it changes, the editor is updated (cursor kept when equal). */
  value?: string;
  /** Initial text for an uncontrolled editor. */
  defaultValue?: string;
  /** Called with the full text on every user edit. */
  onChange?: (value: string, event: editor.IModelContentChangedEvent) => void;
  /** Monaco language id, e.g. "typescript", "json", "yaml". */
  language?: string;
  readOnly?: boolean;
  /** CSS height of the editor box. */
  height?: number | string;
  /** Accessible name of the editor's text area. */
  'aria-label'?: string;
  /** Extra Monaco options, merged over the brand defaults. */
  options?: editor.IStandaloneEditorConstructionOptions;
  className?: string;
  /** Override how Monaco is loaded (self-hosting, preconfigured instance, tests). */
  loader?: MonacoLoader;
  /** Called once the editor instance exists. */
  onMount?: (instance: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
}

/** Monaco code editor themed by the brand tokens; loads Monaco lazily. */
export function CodeEditor({
  value,
  defaultValue = '',
  onChange,
  language = 'plaintext',
  readOnly = false,
  height = 320,
  'aria-label': ariaLabel = 'Code editor',
  options,
  className,
  loader = loadMonaco,
  onMount,
}: CodeEditorProps) {
  const state = useMonaco(loader);
  const monaco = state.monaco;
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<editor.IStandaloneCodeEditor | null>(null);
  const syncing = useRef(false);
  const latest = useRef({ value, defaultValue, language, readOnly, ariaLabel, options, onChange, onMount });
  useLayoutEffect(() => {
    latest.current = { value, defaultValue, language, readOnly, ariaLabel, options, onChange, onMount };
  });

  useBrandTheme(monaco);

  useEffect(() => {
    if (!monaco || !host.current) return undefined;
    const p = latest.current;
    const ed = monaco.editor.create(host.current, {
      ...BASE_OPTIONS,
      ...p.options,
      value: p.value ?? p.defaultValue,
      language: p.language,
      readOnly: p.readOnly,
      ariaLabel: p.ariaLabel,
      theme: brandThemeFor(),
    });
    instance.current = ed;
    const sub = ed.onDidChangeModelContent((event) => {
      if (!syncing.current) latest.current.onChange?.(ed.getValue(), event);
    });
    p.onMount?.(ed, monaco);
    const stopLayout = kickLayout(() => ed.layout());
    return () => {
      stopLayout();
      sub.dispose();
      ed.dispose();
      instance.current = null;
    };
  }, [monaco]);

  useEffect(() => {
    const ed = instance.current;
    if (!ed || value === undefined || ed.getValue() === value) return;
    syncing.current = true;
    try {
      ed.setValue(value);
    } finally {
      syncing.current = false;
    }
  }, [value, monaco]);

  useEffect(() => {
    const model = instance.current?.getModel();
    if (monaco && model) monaco.editor.setModelLanguage(model, language);
  }, [language, monaco]);

  useEffect(() => {
    instance.current?.updateOptions({ ...options, readOnly, ariaLabel });
  }, [options, readOnly, ariaLabel, monaco]);

  return <EditorFrame state={state} height={height} label="code editor" className={className} hostRef={host} />;
}
