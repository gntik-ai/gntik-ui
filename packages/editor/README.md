# @gntik-ai/editor

Monaco (the VS Code editor) themed by the gntik-ui brand tokens. Ships three Monaco
themes — `gntik-dark`, `gntik-light`, `gntik-hc` — built at runtime from the live CSS
variables of `@gntik-ai/tokens`, and two React components that follow the `<html>`
theme class automatically.

```tsx
import '@gntik-ai/tokens/brand.css';
import { CodeEditor, DiffEditor } from '@gntik-ai/editor';

<CodeEditor value={code} onChange={setCode} language="typescript" height={360} aria-label="Agent source" />
<DiffEditor original={before} modified={after} language="yaml" aria-label="Manifest changes" />
```

Monaco is loaded with a dynamic `import('monaco-editor')`, so it is split into its own
chunk and only downloaded when an editor mounts. A token-styled skeleton shows until then.

## Workers (required)

Monaco runs its language services in web workers. The package does not import them —
each bundler resolves workers differently — so wire them once at app start-up.

### Vite

```ts
// src/monaco-workers.ts — import this once, before any editor renders.
import { configureMonacoWorkers } from '@gntik-ai/editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

configureMonacoWorkers((_id, label) => {
  if (label === 'json') return new JsonWorker();
  if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
  if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker();
  if (label === 'typescript' || label === 'javascript') return new TsWorker();
  return new EditorWorker();
});
```

Only need syntax highlighting? Return `new EditorWorker()` for every label and skip the rest.

## API

| Export | Purpose |
| --- | --- |
| `CodeEditor` | `value` / `defaultValue`, `onChange(value, event)`, `language`, `readOnly`, `height`, `aria-label`, `options`, `className`, `loader`, `onMount`. |
| `DiffEditor` | `original`, `modified`, `language`, `readOnly` (default `true`), `sideBySide`, `onChange(modified)`, `height`, `aria-label`, `options`, `className`, `loader`, `onMount`. |
| `defineBrandThemes(monaco)` | Registers the three brand themes from the live tokens. Call again after a theme switch (the components do). |
| `brandThemeFor(theme?)` | `'dark' \| 'light' \| 'high_contrast'` → Monaco theme name (defaults to the active theme). |
| `brandThemeData(theme, el?)` | The raw `IStandaloneThemeData` for one theme. |
| `configureMonacoWorkers(getWorker)` | Sets `self.MonacoEnvironment.getWorker`. |
| `loadMonaco`, `useMonaco`, `useBrandTheme`, `BASE_OPTIONS`, `EditorSkeleton` | Building blocks for custom Monaco surfaces. |

### Custom loader

Pass `loader` to use a preconfigured or self-hosted Monaco (or a mock in tests):

```tsx
const loader = () => import('monaco-editor').then((m) => {
  m.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true });
  return m;
});
<CodeEditor loader={loader} … />
```

Keep the loader identity stable (module scope or `useCallback`); a new function reloads Monaco.

## Notes

- Monaco themes only accept hex, so colours are converted with `tokenHex` from
  `@gntik-ai/tokens/runtime`; alpha is appended as a hex suffix. No colour literals.
- `monaco.editor.setTheme` is global: every Monaco instance on the page shares one theme.
- Light tokens live on `:root`, so `gntik-light` is only exact while light is active; the
  components redefine all themes on every switch, so the active theme is always correct.
