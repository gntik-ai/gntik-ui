import { CodeEditor, type CodeEditorProps, type Monaco } from '@gntik-ai/editor';
import './monaco-workers';

type EditorInstance = Parameters<NonNullable<CodeEditorProps['onMount']>>[0];

const MODEL_URI = 'file:///sandbox/App.tsx';

/**
 * Gives the editor a `.tsx` model (so the TypeScript worker parses JSX) and keeps only syntax
 * diagnostics: the kit's types are not loaded in the worker, so semantic errors would be noise.
 */
function setup(ed: EditorInstance, monaco: Monaco) {
  const ts = monaco.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    allowNonTsExtensions: true,
    strict: true,
  });
  ts.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });

  const uri = monaco.Uri.parse(MODEL_URI);
  const previous = ed.getModel();
  let model = monaco.editor.getModel(uri);
  if (model) model.setValue(ed.getValue());
  else model = monaco.editor.createModel(ed.getValue(), 'typescript', uri);
  ed.setModel(model);
  if (previous && previous !== model) previous.dispose();
}

export interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/** The sandbox's one TSX file, in the brand-themed Monaco editor. */
export function SourceEditor({ value, onChange }: SourceEditorProps) {
  return (
    <CodeEditor
      value={value}
      onChange={onChange}
      language="typescript"
      height="100%"
      aria-label="App.tsx source"
      onMount={setup}
    />
  );
}
