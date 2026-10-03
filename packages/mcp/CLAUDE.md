# gntik-ui-mcp (CLAUDE.md)

Este subproyecto es el **MCP server del design system gntik-ui**: expone el
catálogo (inventario, snippets canónicos, tokens, reglas) como tools MCP para
remaquetar páginas de otras apps desde Claude Code.

## Arquitectura (src/)
- `index.ts` — entrada CLI (`--stdio` defecto · `--http` para k8s). Logs SIEMPRE a stderr.
- `config.ts` — env + flags (GNTIK_UI_DIR / GNTIK_UI_REPO / PORT / …).
- `source.ts` — localiza el catálogo: dir explícito → autodetección (`../` del repo) → clon git propio. Nunca hace pull de un checkout del usuario.
- `indexer.ts` — parsea `registry.jsx` (vm sobre el array), snippets `const X = \`…\`` referenciados por `code={X}` (+ inline), `tokens/brand.css`, `tailwind.config` de index.html y docs.
- `analyze.ts` — heurísticas página legacy → componentes sugeridos + frameworks detectados.
- `validate.ts` — reglas duras de marca (hex, paleta Tailwind, degradados, glow, `dark:`, fuentes). La trama `repeating-*-gradient` con `var(--…)` está permitida.
- `server.ts` — 11 tools + prompts `remaquetar` / `preparar_producto` + resources.
- `http.ts` — Streamable HTTP **stateless** (server nuevo por request, índice compartido) + `/healthz` `/readyz`.

## Comandos
- `npm test` — build + unit tests (corren contra el catálogo real del monorepo, `../../`).
- `npm run smoke` — E2E con el cliente MCP oficial por stdio (obligatorio antes de dar algo por hecho).
- `npm run dev` / `dev:http` — tsx en caliente.

## Reglas
- stdout es del protocolo stdio: jamás `console.log` en código de server.
- Si cambias el parseo del indexer, añade el caso al test correspondiente y ejecuta contra el catálogo real.
- La imagen (packages/mcp/Dockerfile, contexto = raíz del monorepo) empaqueta registry.json: cambios de componentes también reconstruyen imagen (workflow `gntik-ui-mcp.yml`).
- `registry.json` (raíz del monorepo) es el índice generado que sirve el server: tras tocar el catálogo, `pnpm registry` y commitearlo (CI lo verifica con `pnpm registry:check`).
