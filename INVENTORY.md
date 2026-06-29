# Gntik UI — Inventario de la template

Template de marca **musematic** → React + Tailwind sobre una capa de tokens
(`tokens/brand.css`). Cada componente: preview interactivo + código para pegar.
El inventario vivo está en el catálogo (sección **Overview**) y en `registry.jsx`;
este archivo es el espejo en texto.

**Catálogo:** `gntik-ui/index.html` · **Tokens:** `tokens/brand.css` · Temas: light · dark · high_contrast

Estado: 🟢 listo · 🟡 en curso · ⬜ pendiente

---

## Estado: **57 / 57 listos** 🟢

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
| **Feedback** | Alerts · Empty states · **Skeletons** | 🟢 |
| **Navegación** | Navbars · Breadcrumbs · Tabs · Vertical nav · Sidebar nav · Pagination · Progress bars · Command palettes | 🟢 |
| **Overlays** | Modal dialogs · Drawers · Notifications · **Tooltips** | 🟢 |
| **Elementos** | Buttons · Button groups · Badges & pills · Avatars · Dropdowns · Dividers | 🟢 |
| **Layout** | Containers · Cards | 🟢 |
| **Filtros** | Filters (buscador + popovers + chips + vistas guardadas) | 🟢 |
| **Flow** | ReactFlow (arrastrar nodos · zoom/pan · handles · edges) | 🟢 |

### Último pase
- 🟢 **Tooltips** (Overlays) — sólido invertido + toolbar de iconos con atajo + tooltip enriquecido en card.
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
```
gntik-ui/
├─ index.html        ← catálogo (Tailwind config + tokens + carga JSX + mount)
├─ tokens/brand.css  ← capa de marca (el único punto de re-skin)
├─ kit.jsx           ← primitivas: Icon · Logo · CodeBlock · Card · ScaleFrame · hooks
├─ chartkit.jsx      ← motor de gráficas (Recharts con tema de marca)
├─ registry.jsx      ← INVENTARIO (fuente única: grupos · estado · helpers)
├─ catalog.jsx       ← marco: sidebar + topbar + theme switch + router
├─ overview.jsx      ← dashboard de progreso / inventario
├─ foundations.jsx   ← tokens visualizados
├─ app-shell.jsx     ← shell interactivo + código
└─ <grupo>.jsx       ← una sección por archivo, registrada en window.SECTIONS
```
Añadir un componente = nueva sección en su `.jsx` + `window.SECTIONS['id'] = ...` +
su `<script>` en `index.html` + `status: 'done'` en `registry.jsx`.
