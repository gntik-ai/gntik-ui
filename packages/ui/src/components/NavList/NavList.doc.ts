import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'NavList',
  group: 'Navigation',
  status: 'beta',
  description:
    'Vertical navigation for sidebars and settings pages: labelled (optionally foldable) groups of items with icon, label and badge, nested collapsible sub-items, and aria-current="page" on the active item with the brand accent bar. `collapsed` turns it into an icon rail with tooltips (nested sections open as flyout menus). Links render through LinkProvider, so client routers work. Matching defaults to strict href equality (including query/hash). Opt in with list-wide match="prefix" or item.match; an item override takes precedence. Prefix matching ignores query/hash and a trailing slash, respects segment boundaries, and matches / only at the root. Item.pattern accepts a string or array: :name matches one non-empty segment and a final * matches zero or more remaining segments; other * segments are literal, never regular expressions. One computed item wins across groups and descendants: exact href first, then the longest matching href or pattern by segment count, with document-order ties. Explicit current:false excludes an item; any current:true suppresses computation. Matched descendants open their section and activate its rail flyout. NavListRouteMatching demonstrates /functions/fn-42, inherited prefix matching, exact overrides and dynamic project patterns. Exported matchesNavPath, matchesNavPattern, resolveCurrentNavItem and isNavItemCurrent are pure and router-agnostic.',
  primitive: '@base-ui/react/collapsible',
  pattern: 'navigation landmark with disclosure sections',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves through items, group toggles and section toggles in order'],
    ['Enter', 'Follows the focused link (or runs the item button)'],
    ['Enter / Space', 'On a group heading or nested section: expands or collapses it'],
    ['Enter / Space (rail)', 'Opens a nested section as a flyout menu (arrow keys move, Escape closes)'],
  ],
  dataAttributes: [
    ['data-panel-closed', 'groupChevron', 'The associated panel is closed.'],
    ['data-starting-style', 'panel', 'The part is entering.'],
    ['data-ending-style', 'panel', 'The part is leaving.'],
    ['data-panel-closed', 'parentChevron', 'The associated panel is closed.'],
  ],
  tokens: [
    'chrome',
    'accent',
    'accent-foreground',
    'primary',
    'primary-text',
    'secondary',
    'border',
    'muted-foreground',
    'foreground',
    'focus-ring',
  ],
};
