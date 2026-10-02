# Gntik UI — sistema de diseño de marca (CLAUDE.md)

Este proyecto ES **gntik-ui**: el design system **agnóstico** de los productos gntik-ai
(musematic, Falcone, llmwiki…), con layout + estilos nacidos en musematic. Hoy es un catálogo
estilo Tailwind Plus: cada componente se **ve** (preview interactivo) y trae su **código
React/Tailwind** para pegar. Rumbo: monorepo estilo Astryx (ver la propuesta de evolución).

## Decisiones (fijadas con el usuario — no revertir sin preguntar)
- **Contenido: agnóstico.** El núcleo no nombra ningún producto. musematic, Falcone y
  llmwiki son *presets* de tema (logo, nombre, assets) + apps de ejemplo; sus datos de
  dominio viven en fixtures, nunca en los componentes.
- **Colores congelados:** los valores HSL de `tokens/brand.css` no cambian. Los presets
  solo difieren en logo, nombre y assets. El contraste se arregla emparejando tokens
  existentes (texto verde/ámbar en light → tokens más oscuros), nunca cambiando valores.
- **Idioma:** catálogo y docs en inglés.
- **Formato (destino):** pnpm + Vite, React 19 + Tailwind 4 sobre la capa de tokens.
  El catálogo actual (CDN + Babel) se mantiene hasta completar la migración.
- **Primitivas headless:** Base UI. **Paquetes:** `@gntik-ai/*` en GitHub Packages.
  **Docs:** Vercel.
- **Interactividad:** todo lo interactivo posible (overlays abren, ⌘K filtra, toggles,
  drag + zoom/pan en reactflow).
- **Temas:** dark (por defecto) · light · high_contrast. Switch en la topbar.
- **Una canónica por componente**; luego se afina con feedback, uno a uno.

## Tokens = la marca (único punto de re-skin)
`packages/tokens/src/brand.css` (`@gntik-ai/tokens`) define todo: color, tipografía, radios,
sombras × 3 temas. HSL en canales (sin `hsl()`) → habilita `bg-primary/14`. Un test congela
los valores (`packages/tokens/test/frozen-values.json`). `tailwind.css` es el puente Tailwind v4
(token → utilidad). Claves: verde `145 61% 50%`, Geist + Geist Mono, `--chrome` (sidebar/topbar;
negro-verde en dark), `--radius 0.625rem`, sombras planas.

## Arquitectura (monorepo pnpm · Node 24 · <1000 líneas/archivo)
- `apps/docs` — el catálogo: Vite 8 + React 19 + Tailwind 4. `src/main.jsx` importa los
  `.jsx` de `src/catalog/` en orden; `src/globals.js` expone React, Recharts y ReactFlow en
  `window` (las secciones siguen leyendo de `window`). `src/styles.css` = Tailwind + tokens.
- `apps/docs/src/catalog/kit.jsx` — primitivas: Icon, Logo/Wordmark, CodeBlock, Card,
  SectionHead, StatusTag, ScaleFrame, useClickOutside.
- `apps/docs/src/catalog/registry.jsx` — **INVENTARIO** (fuente única): grupos → items con
  `status`. Mueve el sidebar, el dashboard y el contador a la vez.
- `catalog.jsx` (marco + router + theme switch), `overview.jsx` (landing), y una sección por
  archivo registrada en `window.SECTIONS['id']`.
- `packages/mcp` — MCP server; sirve `registry.json` (raíz), generado con `pnpm registry`.

## Cómo añadir un componente
1. Crear/editar el `.jsx` de su grupo en `apps/docs/src/catalog/`: sección con preview
   interactivo + `<CodeBlock>` con el código React/Tailwind real para pegar.
2. `window.SECTIONS['id'] = Seccion`; si es archivo nuevo, importarlo en `apps/docs/src/main.jsx`.
3. Poner `status:'done'` en `registry.jsx`, luego `pnpm registry` y `pnpm visual:update`.
Cada archivo lee de `window` arriba (`const { ... } = window;`) y exporta a `window` al final.
Nombrar los objetos de estilo de forma única (nunca `const styles`).
Antes de dar algo por hecho: `pnpm lint && pnpm typecheck && pnpm test && pnpm registry:check`.

## Reglas (duras)
- Sobrio: sin degradados, sin glow; sombras planas brand-tinted. Mono-brand verde (hue 145)
  único color de marca; el primario no se confunde con severidad (rojo/ámbar/azul-info).
- Cero colores hardcodeados: siempre clases `bg-*/text-*/border-*` que resuelven a tokens.
- Respuestas concisas y directas. Construir en tandas; seguir el inventario; afinar por
  componente con el feedback del usuario.
