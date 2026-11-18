import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'SidebarLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Application shell: a collapsible sidebar (expanded, 64px icon rail or off-canvas) with header, body and footer slots, a topbar (workspace switcher, breadcrumb, ⌘K, notifications, theme, user menu) and the main region. Below lg the sidebar moves into a left Drawer opened from the topbar menu button. The collapsed state is controllable and can persist in localStorage (storageKey). Fills its container; fullScreen switches to h-dvh. Overflowing main content becomes a named Tab stop; mainLabel overrides the localized Main content name (Contenido principal in Spanish). A fitting main stays outside the Tab order and remains the skip-link target.',
  primitive: '@base-ui/react/drawer',
  pattern: 'landmarks (complementary sidebar, banner topbar, main) + skip link + disclosure toggle',
  keyboard: [
    ['Tab / Arrow keys', 'When main overflows, Tab reaches it and arrow keys scroll its content'],
    ['Tab (first stop)', 'Reveals the skip link; Enter moves focus to <main>'],
    ['Enter / Space', 'On the collapse toggle: collapses or expands the sidebar (aria-expanded reflects it)'],
    ['Enter / Space', 'On the menu button (small screens): opens the navigation drawer and moves focus inside'],
    ['Escape', 'Closes the navigation drawer and returns focus to the menu button'],
  ],
  tokens: ['chrome', 'background', 'foreground', 'border', 'card', 'primary', 'muted-foreground', 'focus-ring'],
};
