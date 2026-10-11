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
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/languages/features/json/json.worker?worker';
import CssWorker from 'monaco-editor/languages/features/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/languages/features/html/html.worker?worker';
import TsWorker from 'monaco-editor/languages/features/typescript/ts.worker?worker';

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

## Consumer-injected YAML diagnostics (Monaco 0.57)

The kit does not depend on `monaco-yaml` and never imports a worker. Install a compatible
`monaco-yaml` in the consumer (the docs example uses 5.5.1 with `monaco-editor` 0.57.0).
The integration lives behind a stable lazy loader. Do not import these worker constructors
from your app entry if you want to defer their chunks until the editor opens.

```ts
// yaml-workers.ts: loaded only by yaml-loader.ts
import { configureMonacoWorkers } from '@gntik-ai/editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import YamlWorker from 'monaco-yaml/yaml.worker?worker';

configureMonacoWorkers((_id, label) => {
  if (label === 'yaml') return new YamlWorker();
  return new EditorWorker();
});
```

```ts
// yaml-loader.ts: keep this module's loader identity stable
import type { MonacoLoader } from '@gntik-ai/editor';
let configured: ReturnType<MonacoLoader> | undefined;
export const yamlLoader: MonacoLoader = () => {
  configured ??= Promise.all([import('./yaml-workers'), import('monaco-editor'), import('monaco-yaml')]).then(
    ([, monaco, { configureMonacoYaml }]) => {
      configureMonacoYaml(yamlMonaco(monaco), {
        enableSchemaRequest: false,
        validate: true,
        schemas: [
          {
            uri: 'inmemory://schemas/workflow.json',
            fileMatch: ['*'],
            schema: {
              type: 'object',
              required: ['count'],
              properties: { count: { type: 'integer' } },
            },
          },
        ],
      });
      return monaco;
    },
  );
  return configured;
};
```

For `monaco-yaml` 5.5.1 and its `monaco-worker-manager` 2.0.1 dependency, put this
consumer adapter in `yaml-loader.ts`. Monaco 0.57 requires a `worker` instance in
`createWebWorker`; the older worker manager supplies `moduleId`, `label` and
`createData` instead. Passing those options directly silently selects Monaco's generic
worker, which cannot run YAML validation. The adapter requests the YAML worker through
`getWorker`, initializes its legacy bootstrap with the schema options, and passes it to
Monaco's current API. It only adapts the Monaco facade given to `configureMonacoYaml`.

```ts
import type { Monaco } from "@gntik-ai/editor";

function yamlMonaco(monaco: Monaco): Monaco {
  return {
    ...monaco,
    editor: {
      ...monaco.editor,
      createWebWorker<T extends object>(options: {
        createData?: unknown;
        label?: string;
        host?: Parameters<Monaco['editor']['createWebWorker']>[0]['host'];
        keepIdleModels?: boolean;
      }) {
        const worker = Promise.resolve(
          globalThis.MonacoEnvironment!.getWorker!(
            "workerMain.js",
            options.label ?? "yaml",
          ),
        ).then((worker) => {
          worker.postMessage("-please-ignore-");
          worker.postMessage(options.createData);
          return worker;
        });
        return monaco.editor.createWebWorker<T>({
          worker,
          host: options.host,
          keepIdleModels: options.keepIdleModels,
        });
      },
    },
  };
}
```

The running example is `apps/docs/src/examples/yaml-loader.js` and its sibling
`yaml-monaco.js`. After building the docs, `node apps/docs/scripts/check-yaml-worker.mjs`
checks the real bundled worker's schema diagnostics without an HTTP server. The browser
test additionally checks the Problems list and production CSP.

Monaco 0.57 exports shorter public subpaths. `monaco-worker-manager` 2.0.1, used by
`monaco-yaml` 5.5.1, still imports the legacy `monaco-editor/esm/vs/` path. Keep the alias
in the consumer Vite config for that dependency, including worker builds:

```ts
import { fileURLToPath } from 'node:url';
export default {
  resolve: {
    alias: [
      {
        find: /^monaco-editor\/esm\/vs\//,
        replacement: fileURLToPath(new URL('./node_modules/monaco-editor/esm/vs/', import.meta.url)),
      },
    ],
  },
  worker: { format: 'es' },
};
```

Vite's `?worker` constructors load module workers from bundled same-origin assets. Serve
production with `script-src 'self'; worker-src 'self' blob:; connect-src 'self'`. Monaco
also needs its generated inline styles (`style-src 'self' 'unsafe-inline'`); fonts and
stylesheets must be bundled on the same origin. Always supply the schema inline and set
`enableSchemaRequest: false`. Do not configure remote `$ref` dependencies, schema stores,
or CDN loaders. The kit's default `loadMonaco` is an ESM import, never a CDN request.

```tsx
<CodePanel
  files={[{ path: 'flow.yaml', language: 'yaml', content: 'count: wrong\n' }]}
  problems={[]}
  loader={yamlLoader}
  markers={[
    {
      id: 'semantic',
      owner: 'semantic-worker',
      file: 'flow.yaml',
      line: 1,
      severity: 'warning',
      message: 'Review the terminal step.',
    },
  ]}
  readOnly={runMode}
  onValidityChange={(valid) => setCanSave(valid)}
/>
```

Set `markers` (even an empty list), `onMonacoReady`, or `onValidityChange` to opt
into model diagnostics. `readOnly` controls editing independently. Omitting diagnostics
extensions preserves the caller-supplied Problems list. Collection covers both the code editor and the modified diff model.

`CodePanel` subscribes to the public Monaco marker API for every mounted file model and
merges every owner's markers into its Problems list. It reserves each `markers[].owner`
for that consumer marker group, writes those line markers to the model, and clears them
when removed or unmounted. Consumer markers also appear for files not yet opened. Keep
owners distinct from `yaml`; owner groups supplied through `markers` replace that group's
model diagnostics, so they are listed once.

`onMonacoReady(monaco)` is an alternative setup hook for already-loaded consumer services;
it runs once per Monaco instance in the panel and may return a disposer. Prefer the loader
for language registration before editor creation. Validity is based on the merged error
count: no notification for an initially clean panel, `false` when errors become nonzero,
and `true` when the last error clears. Warnings do not change validity. `readOnly` reaches
both CodeEditor and DiffEditor; leaving it undefined preserves each editor's defaults.

The production docs example is `/builders.html?item=code-panel&mode=edit&theme=dark`.
`apps/docs/e2e/builders.a11y.spec.js` checks Worker response evidence for `getWorker('yaml')`,
inline-schema errors alongside consumer markers, no CSP violations or external requests,
and axe in dark, light and high_contrast for the code panel, flow builder and workflow page
in edit and run modes. Build the docs before running that Playwright file.
