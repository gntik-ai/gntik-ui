# gntik-ui-mcp — remaquetación asistida con el design system

MCP server que expone el catálogo **gntik-ui** (inventario, código canónico de
los 57+ componentes, tokens de marca, app-shell y reglas duras) como tools para
**Claude Code**. Con él, remaquetar una página legacy es: analizar → traer los
componentes de marca → reescribir → validar hasta 0 errores.

Funciona con cualquier app (React, Angular, Vue, HTML…): el código de
referencia es React+Tailwind, pero las clases de token se trasladan tal cual a
cualquier template.

```
Claude Code ──stdio──► gntik-ui-mcp ──lee──► catálogo gntik-ui (../)
Claude Code ──http───► gntik-ui-mcp (k8s) ─► catálogo empaquetado en la imagen
```

## Tools

| Tool | Qué hace |
|---|---|
| `overview` | Marca, inventario, reglas y flujo recomendado. Llamada inicial. |
| `list_components` / `search_components` | Inventario navegable / búsqueda por palabras clave. |
| `get_component` | Doc + TODO el código canónico de un componente (`buttons`, `tables`, …). |
| `get_app_shell` | El chrome compartido (sidebar+topbar+header), opcionalmente con `blocks/Shell.html`. |
| `get_tokens` | `tokens/brand.css` por tema, en css o json. |
| `get_adoption_guide` | Cómo enganchar un producto: import de tokens, `tailwind.config`, temas, Geist. |
| `get_rules` | Reglas duras + qué comprueba exactamente el validador. |
| `analyze_page` | Página legacy → componentes gntik-ui sugeridos + frameworks detectados + violaciones. |
| `validate_page` | Valida la página remaquetada (hex, paleta Tailwind, degradados, glow, `dark:`, fuentes). |
| `sync_design_system` | Re-indexa el catálogo (git pull si el server lo clonó él mismo). |

**Prompts** (slash commands en Claude Code): `/mcp__gntik-ui__remaquetar` (flujo
completo por página) y `/mcp__gntik-ui__preparar_producto` (wiring inicial de un
producto nuevo). **Resources**: `gntik-ui://tokens`, `gntik-ui://reglas`,
`gntik-ui://inventario`, `gntik-ui://componente/{id}`.

## Uso local con Claude Code (stdio)

```bash
cd gntik-ui/mcp
npm ci && npm run build

# en el repo de la app a remaquetar:
claude mcp add gntik-ui -- node /ruta/a/gntik-ui/mcp/dist/index.js --stdio
# o por proyecto: copia .mcp.json.example como .mcp.json y ajusta la ruta
```

Remaquetar una página desde Claude Code:

```
> /mcp__gntik-ui__remaquetar pagina=src/pages/voices.component.html
```

o en lenguaje natural: *"remaqueta src/pages/Fleet.tsx con el design system"* —
Claude usará `analyze_page` → `get_component` → `validate_page`.

## Kubernetes / OpenShift (Streamable HTTP)

La imagen se publica en `ghcr.io/gntik-ai/gntik-ui-mcp` (workflow
`.github/workflows/gntik-ui-mcp.yml`: tests + smoke E2E → build multi-arch).

```bash
kubectl apply -k mcp/k8s        # Deployment + Service (Ingress/Route aparte)
# endpoint MCP:  POST /mcp   · probes: GET /healthz · GET /readyz

# conectar Claude Code al server del clúster:
claude mcp add --transport http gntik-ui https://gntik-ui-mcp.tu-dominio.com/mcp
```

Es **stateless** (sin sesiones): escala horizontal sin sticky sessions. La
imagen lleva un snapshot del catálogo; para seguir una rama en vivo define
`GNTIK_UI_REPO` (+ `GNTIK_UI_SYNC_MINUTES`, y `GITHUB_TOKEN` si es privado) —
ver comentarios en `k8s/deployment.yaml`.

También puedes correr la imagen en local:

```bash
docker build -f mcp/Dockerfile -t gntik-ui-mcp .   # contexto = raíz del repo
docker run --rm -p 8080:8080 gntik-ui-mcp
```

## Configuración

| Variable | Defecto | Descripción |
|---|---|---|
| `MCP_TRANSPORT` | `stdio` | `stdio` \| `http` (flags `--stdio` / `--http` mandan) |
| `PORT` | `8080` | Puerto HTTP |
| `GNTIK_UI_DIR` | autodetección `../` | Checkout local del catálogo |
| `GNTIK_UI_REPO` | — | URL git del catálogo (si no hay checkout) |
| `GNTIK_UI_REF` | `main` | Rama/tag a seguir |
| `GNTIK_UI_TOKEN` / `GITHUB_TOKEN` | — | Token para repo privado |
| `GNTIK_UI_CACHE` | `$TMPDIR/gntik-ui-mcp` | Directorio del clon propio |
| `GNTIK_UI_SYNC_MINUTES` | `0` (off) | Auto-sync del clon propio |

El server **nunca** hace `git pull` sobre un checkout local del usuario; solo
sobre el clon que gestiona él mismo.

## Releases

- Push a `main` → `ghcr.io/gntik-ai/gntik-ui-mcp:latest` (+`sha-…`). El
  snapshot del catálogo va dentro, así que cambios de componentes también
  publican imagen.
- Tag `mcp-vX.Y.Z` → imagen `X.Y.Z`.

## Desarrollo

```bash
npm test        # build + unit tests (indexer/validate/analyze contra el catálogo real)
npm run smoke   # E2E: cliente MCP oficial por stdio ejercitando todas las tools
npm run dev     # tsx --stdio · npm run dev:http para HTTP
```
