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
`tokens/brand.css` define todo: color, tipografía, radios, sombras × 3 temas. HSL en
canales (sin `hsl()`) → habilita `bg-primary/14`. Re-skinear un producto = editar el
bloque de marca + cambiar el logo. Claves: verde `145 61% 50%`, Geist + Geist Mono,
`--chrome` (sidebar/topbar; negro-verde en dark), `--radius 0.625rem`, sombras planas.

## Arquitectura (modular · <1000 líneas/archivo)
- `index.html` — Tailwind config (mapea cada token a `hsl(var(--token) / <alpha-value>)`)
  + carga los `.jsx` + monta `CatalogShell`.
- `kit.jsx` — primitivas: Icon, Logo/Wordmark, CodeBlock (copiar), Card, SectionHead,
  StatusTag, ScaleFrame, useClickOutside; exporta los hooks a `window`.
- `registry.jsx` — **INVENTARIO** (fuente única): grupos → items con `status`. Mueve el
  sidebar, el dashboard y el contador a la vez.
- `catalog.jsx` — marco: sidebar (nav desde registry con estado) + topbar (theme switch)
  + router (hash + localStorage). Expone `window.__goto` y `window.__setTheme`.
- `overview.jsx` — dashboard de progreso / inventario (la landing).
- `foundations.jsx`, `app-shell.jsx`, … — una sección por archivo, registrada en
  `window.SECTIONS['id']`.

## Cómo añadir un componente
1. Crear/editar el `.jsx` de su grupo: sección con preview interactivo + `<CodeBlock>`
   con el código React/Tailwind real para pegar.
2. `window.SECTIONS['id'] = Seccion`; si es archivo nuevo, añadir su `<script>` en `index.html`.
3. Poner `status:'done'` en `registry.jsx` (contador y placeholders se actualizan solos).
Cada `<script type="text/babel">` tiene su scope: leer de `window` arriba
(`const { ... } = window;`) y exportar a `window` al final. Nombrar los objetos de estilo
de forma única (nunca `const styles`).

## Reglas (duras)
- Sobrio: sin degradados, sin glow; sombras planas brand-tinted. Mono-brand verde (hue 145)
  único color de marca; el primario no se confunde con severidad (rojo/ámbar/azul-info).
- Cero colores hardcodeados: siempre clases `bg-*/text-*/border-*` que resuelven a tokens.
- Respuestas concisas y directas. Construir en tandas; seguir el inventario; afinar por
  componente con el feedback del usuario.
