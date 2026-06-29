# Gntik UI — sistema de diseño de marca (CLAUDE.md)

Este proyecto ES **gntik-ui**: la template de componentes de marca, extraída de la app
**musematic**, para reutilizar layout + estilos en futuras aplicaciones. Es un catálogo
estilo Tailwind Plus: cada componente se **ve** (preview interactivo) y trae su **código
React/Tailwind** para pegar.

## Decisiones (fijadas con el usuario — no revertir sin preguntar)
- **Contenido: dominio musematic** (Fleet, agents, costs, policies, operator…). NO es
  product-agnostic — se usa el lenguaje real de musematic, como en el app-shell aprobado.
- **Formato:** React + Tailwind (CDN + Babel en el catálogo) sobre la capa de tokens.
  Preview interactivo + código copiable por componente.
- **Interactividad:** todo lo interactivo posible (overlays abren, ⌘K filtra, toggles,
  drag + zoom/pan en reactflow).
- **Temas:** dark (principal) · light · high_contrast. Switch en la topbar.
- **Una canónica por componente** (la de marca); luego se afina con feedback, uno a uno.

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
