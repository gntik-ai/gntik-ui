# Gntik UI — Inventario de la template

Template de marca **musematic** → React + Tailwind sobre una capa de tokens
(`tokens/brand.css`). Cada componente: preview interactivo + código para pegar.
El inventario vivo está en el catálogo (sección **Overview**) y en `registry.jsx`;
este archivo es el espejo en texto.

**Catálogo:** `gntik-ui/index.html` · **Tokens:** `tokens/brand.css` · Temas: light · dark · high_contrast

Estado: 🟢 listo · 🟡 en curso · ⬜ pendiente

---

## Estado: **59 / 59 listos** 🟢

Todos los componentes del inventario están construidos (preview interactivo + código).
El contador del sidebar y del Overview se calcula solo desde `registry.jsx`.

| Grupo | Componentes | Estado |
|---|---|---|
| **Empezar** | Overview | 🟢 |
| **Fundamentos** | Foundations (color · tipografía · espaciado · radios · sombras · iconos) | 🟢 |
| **App shell** | App shell (sidebar + topbar + cabecera de página) | 🟢 |
| **Headings** | Page headings · Section headings · Card headings | 🟢 |
| **Datos** | Description lists · Stats · Billing & usage · Calendars | 🟢 |
| **Gráficas** | Area · Bar · Line · Combo · Donut charts | 🟢 |
| **Listas** | Stacked lists · Tables · Grid lists · List containers · Feeds | 🟢 |
| **Formularios** | Form layouts · Input groups · **File upload** · Textareas · Select menus · Comboboxes · Checkboxes · Radio groups · Toggles · Action panels · Date & time picker · Sign-in & registro | 🟢 |
| **Feedback** | Alerts · Empty states · Skeletons · **Spinners** | 🟢 |
| **Navegación** | Navbars · Breadcrumbs · Tabs · Vertical nav · Sidebar nav · Pagination · Progress bars · Command palettes | 🟢 |
| **Overlays** | Modal dialogs · Drawers · Notifications · **Tooltips** | 🟢 |
| **Elementos** | Buttons · Button groups · Badges & pills · Avatars · Dropdowns · Dividers | 🟢 |
| **Layout** | Containers · Cards | 🟢 |
| **Filtros** | Filters (buscador + popovers + chips + vistas guardadas) | 🟢 |
| **Flow** | ReactFlow (arrastrar nodos · zoom/pan · handles · edges) | 🟢 |
| **Editores** | Monaco Editor (edición · diff · embebido · multi-lenguaje) | 🟢 |

### Último pase
- 🟢 **Tooltips** (Overlays) — sólido invertido + toolbar de iconos con atajo + tooltip enriquecido en card.
- 🟢 **Spinners** (Feedback) — tres puntos en onda, anillo circular (SVG + bordes) y loader de marca musematic; swap en contexto.
- 🟢 **Skeletons** (Feedback) — primitiva `animate-pulse`, lista, tabla y swap cargando → cargado.
- 🟢 **File upload** (Formularios) — dropzone multi-archivo con progreso y estados, input compacto y subida de logo.

---

## Posibles siguientes (no comprometidos)
La librería de **componentes** está cerrada. El terreno abierto es el de **layouts** —
páginas completas que compongan los componentes en pantallas reales (lo que Tailwind
Plus llama *Page Examples*):
- Dashboard del Fleet · Detalle de agent · Settings · Detalle de coste/billing · Pantalla de auth.

Lo abrimos cuando se decida; cada página se ensambla con piezas ya existentes.

## Estructura de archivos
Ver `README.md` (monorepo pnpm: `apps/docs` = catálogo, `packages/tokens`, `packages/mcp`).
Añadir un componente = sección en `apps/docs/src/catalog/<grupo>.jsx` + `window.SECTIONS['id']`
+ import en `apps/docs/src/main.jsx` + `status: 'done'` en `registry.jsx` + `pnpm registry`.
