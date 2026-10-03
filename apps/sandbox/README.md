# @gntik-ai/sandbox

In-browser playground for gntik-ui: edit one TSX file against the whole kit, see it live in
the three themes and the three brand presets, and share it as a link.

```bash
pnpm --filter @gntik-ai/sandbox dev       # http://localhost:5173
pnpm --filter @gntik-ai/sandbox build     # tsc --noEmit && vite build
pnpm --filter @gntik-ai/sandbox preview   # http://localhost:4177
```

The kit packages are consumed from their built `dist` (run `npx tsdown` in a package after
changing it), like any product would.

## How it works

| Piece | File |
| --- | --- |
| Shell: toolbar, editor, split layout (`SplitLayout`), toasts | `src/main.tsx`, `src/App.tsx`, `src/SandboxToolbar.tsx` |
| Editor: `@gntik-ai/editor` `CodeEditor` (Monaco) on a `file:///sandbox/App.tsx` model | `src/SourceEditor.tsx`, `src/monaco-workers.ts` |
| Preview frame: compiles, evaluates and renders the code | `preview.html`, `src/preview/main.tsx` |
| Compiler + module shim | `src/preview/runtime.ts` |
| Share links | `src/share.ts` |
| Example gallery | `src/examples/*.ts` |

- **Compile.** [sucrase](https://github.com/alangpierce/sucrase) with the `typescript`, `jsx`
  (automatic runtime) and `imports` transforms: types are stripped (not checked), JSX becomes
  `react/jsx-runtime` calls and imports become `require` calls.
- **Evaluate.** The CommonJS output runs with a small `require` that maps `react`,
  `react/jsx-runtime`, `react-dom` and every kit package (`@gntik-ai/ui`, `blocks`,
  `templates`, `charts`, `icons`, `chat`, `flow`) to modules the preview already loaded:
  one React, so context (theme, toasts, links) works. `*.css` imports are ignored (the
  styles are already on the page). Anything else throws a readable error. The **default
  export** is rendered.
- **Isolation.** The preview is a same-origin iframe (`preview.html`) with its own
  `ThemeProvider` (no persistence), so the theme class, breakpoints (the frame width) and
  crashes stay inside it. The shell posts `{ code, theme, brand }` (debounced 250 ms); the
  frame answers `rendered` or `error`. Compile errors, evaluation errors, render errors (error
  boundary) and uncaught errors from handlers/promises all land in the shell's `ErrorPanel`;
  the last good render stays on screen behind a compile error. Links inside the preview never
  navigate the frame (`LinkProvider` with an inert anchor).
- **Theme, brand, width.** The theme toggle drives both the shell and the preview (dark ·
  light · high contrast); the brand select swaps the preset (gntik · musematic · Falcone:
  name and logo only, colours are frozen); the width toggle sizes the frame (390 px, 768 px,
  full).
- **Share.** “Copy link” writes the code (plus theme and brand) to the URL hash and copies
  the URL: `#z=` is `deflate-raw` (CompressionStream) + base64url; `#c=` is plain base64url
  where CompressionStream is missing. Nothing is sent to a server. Opening a link (or pasting
  one in the same tab) loads it.

## Monaco

`@gntik-ai/editor` loads Monaco lazily; the sandbox wires the workers with Vite `?worker`
imports (`src/monaco-workers.ts`). `monaco-editor` is a dependency of `@gntik-ai/editor`, not
of the sandbox, so `vite.config.ts` aliases `sandbox-monaco-worker/*` to that copy's worker
entries. The TypeScript worker reports syntax errors only: the kit's types are not loaded
into it, so semantic checks would flag every kit import.

## Limits

- **Tailwind classes.** Tailwind compiles at build time. Every class used by the kit and by
  the gallery (`src/examples`) exists; a class that appears nowhere else (e.g. a new
  arbitrary value) has no CSS in the sandbox. Compose with kit components and the classes
  they use.
- **One file.** No relative imports; split code into components inside the file.
- **Types are not checked.** Use `pnpm typecheck` in a real app for that.
