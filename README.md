# Gntik UI — template de componentes de marca

Layout + estilos extraídos de **musematic**, para reutilizar en futuras apps.
Catálogo estilo Tailwind Plus: **ves** cada componente y copias su **código React/Tailwind**.
Una capa de tokens, muchos productos: re-skinear = editar `tokens/brand.css` + cambiar el logo.

> Verde `#33CE73` (hue 145) · Geist + Geist Mono · `--radius 0.625rem` · dark = superficie principal · 3 temas.

## Abrir
`index.html` — autocontenido (React + Babel + Tailwind por CDN). Tema **dark** por defecto;
switch (light · dark · HC) en la topbar.

## Estructura
```
gntik-ui/
├─ index.html        catálogo: Tailwind config + tokens + carga JSX + mount
├─ tokens/brand.css  capa de marca — el único punto de re-skin (3 temas)
├─ kit.jsx           primitivas: Icon · Logo · CodeBlock · Card · ScaleFrame · hooks
├─ registry.jsx      INVENTARIO (fuente única: grupos · estado · contador)
├─ catalog.jsx       marco: sidebar + topbar + theme switch + router
├─ overview.jsx      dashboard de progreso / inventario
├─ foundations.jsx   tokens visualizados
├─ app-shell.jsx     shell interactivo + código
├─ chartkit.jsx      motor de gráficas (Recharts con tema de marca)
├─ <grupo>.jsx       una sección por grupo (tooltips · skeletons · file-upload · …)
├─ blocks/           referencias HTML sueltas (Shell · Login · Fleet-filters)
├─ assets/           logos / símbolo / wordmarks
└─ INVENTORY.md      espejo en texto del inventario + tandas sugeridas
```

## Adoptar en un producto
1. `@import "./tokens/brand.css"` en `globals.css` (`:root` light · `.dark` · `.high_contrast`).
2. Mapear los tokens en `tailwind.config` como `hsl(var(--token) / <alpha-value>)` (habilita `bg-primary/50`).
3. Activar tema por clase en `<html>` (`""` = light · `dark` · `high_contrast`).
4. Copiar el código de cada componente desde el catálogo y pegarlo.

## Estado
Inventario + progreso en la sección **Overview** del catálogo (y en `INVENTORY.md`).
La librería de **componentes** está completa: **59 / 59** (todos los grupos en verde).
Siguiente terreno, aún abierto: **layouts** — páginas completas que compongan los
componentes (dashboard del Fleet, detalle de agent, settings…). El contador sale de `registry.jsx`.
