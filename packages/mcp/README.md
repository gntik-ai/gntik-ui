# gntik-ui-mcp — the design system as MCP tools

MCP server that exposes **gntik-ui** to coding agents (Claude Code and any MCP client): the
installable kit (components, layouts, blocks, page templates from `kit-registry.json`), page and
brand-preset scaffolding, the brand tokens, the hard rules and a validator. It also serves the
copy-paste catalog (`registry.json`) for rebuilding legacy pages in any framework.

```
Claude Code ──stdio──► gntik-ui-mcp ──reads──► gntik-ui checkout (../)
Claude Code ──http───► gntik-ui-mcp (k8s) ───► snapshot packed in the image
```

## Tools

**Kit (`kit-registry.json`)**

| Tool | What it does |
|---|---|
| `list_kit` | Components, layouts, blocks and templates; filter by `kind`, `group` and a `query` (all terms must match). |
| `get_component` | A kit component/layout: metadata, keyboard table, tokens, deps, a usage example (imports rewritten to packages) and the full source. Catalog-only ids (`buttons`, `tables`…) return the catalog entry. |
| `get_block` | A block: metadata, components it composes, deps, usage and source. |
| `get_template` | A page template: layout, blocks, whether it renders in `ConsoleShell`, deps, usage and source. |
| `scaffold_page` | A ready-to-paste TSX page: `template=<id>` (with the `shell` prop wired for console templates) or `blocks=[…]` + `layout` (`console` · `page` · `auth-layout` · `stacked-layout` · `docs-layout` · `canvas-layout` · `print-layout`). |
| `scaffold_preset` | A `BrandPreset` module (name + logo mark) like `packages/ui/src/theme/presets.tsx`; optional SVG converted to JSX with its colours mapped to token classes. Colours never change. |

**Design system and rebuilds**

| Tool | What it does |
|---|---|
| `overview` | Brand, inventory, rules and the recommended flows. Call it first. |
| `list_components` / `search_components` | Catalog inventory / keyword search. |
| `get_app_shell` | The catalog chrome (sidebar + topbar + header), optionally with `blocks/Shell.html`. |
| `get_tokens` | `brand.css` per theme, as css or json. |
| `get_adoption_guide` | Wiring a product: tokens, Tailwind v4 bridge, themes, Geist. |
| `get_rules` | Hard rules + exactly what the validator checks. |
| `analyze_page` | Legacy page → suggested entries + detected frameworks + violations. |
| `validate_page` | Checks a page (hex, Tailwind palette, gradients, glow, `dark:`, fonts). |
| `sync_design_system` | Re-indexes (git pull when the server cloned the repo itself). |

**Prompts:** `/mcp__gntik-ui__remaquetar` (rebuild one page) and
`/mcp__gntik-ui__preparar_producto` (initial product wiring) — names kept for compatibility.
**Resources:** `gntik-ui://tokens`, `gntik-ui://reglas`, `gntik-ui://inventario`,
`gntik-ui://componente/{id}`.

## Local use with Claude Code (stdio)

```bash
cd gntik-ui
pnpm install && pnpm --filter @gntik-ai/gntik-ui-mcp build

# in the product repo:
claude mcp add gntik-ui -- node /path/to/gntik-ui/packages/mcp/dist/index.js --stdio
```

Then ask in natural language — *"build the members settings page with gntik-ui"* (→ `list_kit` →
`scaffold_page` → `validate_page`) or *"rebuild src/pages/Fleet.tsx on the design system"*
(→ `analyze_page` → `get_component` → `validate_page`). In this repo, the skills in
`.claude/skills/` (`build-page`, `add-component`, `brand-review`) drive the same tools.

## Kubernetes / OpenShift (Streamable HTTP)

The image is published as `ghcr.io/gntik-ai/gntik-ui-mcp` (workflow
`.github/workflows/gntik-ui-mcp.yml`: tests + E2E smoke → multi-arch build).

```bash
kubectl apply -k packages/mcp/k8s        # Deployment + Service (Ingress/Route separately)
# MCP endpoint: POST /mcp · probes: GET /healthz · GET /readyz
claude mcp add --transport http gntik-ui https://gntik-ui-mcp.your-domain.com/mcp
```

It is **stateless** (no sessions): it scales horizontally without sticky sessions. The image carries
a snapshot of the design system; to follow a branch live set `GNTIK_UI_REPO`
(+ `GNTIK_UI_SYNC_MINUTES`, and `GITHUB_TOKEN` for a private repo) — see `k8s/deployment.yaml`.
The kit tools read `kit-registry.json` and the package sources from that snapshot; when a source
file is not shipped, they link to it on GitHub instead.

```bash
docker build -f packages/mcp/Dockerfile -t gntik-ui-mcp .   # context = repo root
docker run --rm -p 8080:8080 gntik-ui-mcp
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `MCP_TRANSPORT` | `stdio` | `stdio` \| `http` (flags `--stdio` / `--http` win) |
| `PORT` | `8080` | HTTP port |
| `GNTIK_UI_DIR` | autodetect `../` | Local gntik-ui checkout |
| `GNTIK_UI_REPO` | — | Git URL of the repo (when there is no checkout) |
| `GNTIK_UI_REF` | `main` | Branch/tag to follow |
| `GNTIK_UI_TOKEN` / `GITHUB_TOKEN` | — | Token for a private repo |
| `GNTIK_UI_CACHE` | `$TMPDIR/gntik-ui-mcp` | Directory of the server's own clone |
| `GNTIK_UI_SYNC_MINUTES` | `0` (off) | Auto-sync of the server's own clone |

The server **never** runs `git pull` on a user's local checkout, only on the clone it manages.

## Generated files

`pnpm registry` (root) regenerates, from the scripts in `packages/mcp/scripts/` and `src/`:
`kit-registry.json`, `INVENTORY.md`, `registry.json` and `apps/docs/public/llms.txt` +
`llms-full.txt` ([llmstxt.org](https://llmstxt.org) format, `scripts/build-llms.ts`).
`pnpm registry:check` fails in CI when any of them is stale.

## Releases

- Push to `main` → `ghcr.io/gntik-ai/gntik-ui-mcp:latest` (+`sha-…`). The design-system snapshot is
  inside, so component changes also publish an image.
- Tag `mcp-vX.Y.Z` → image `X.Y.Z`.

## Development

```bash
pnpm --filter @gntik-ai/gntik-ui-mcp test    # build + unit tests (node --test) against the real repo
pnpm --filter @gntik-ai/gntik-ui-mcp smoke   # E2E: the official MCP client over stdio
pnpm --filter @gntik-ai/gntik-ui-mcp dev     # tsx --stdio · dev:http for HTTP
```

Source map: `src/kit.ts` (kit-registry loader, doc parsing, export names, usage),
`src/kit-tools.ts` (kit tools), `src/scaffold.ts` (page + preset scaffolding), `src/server.ts`
(catalog tools, prompts, resources), `src/indexer.ts`, `src/analyze.ts`, `src/validate.ts`.
