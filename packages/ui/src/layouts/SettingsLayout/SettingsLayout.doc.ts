import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'SettingsLayout',
  group: 'Layout',
  status: 'beta',
  description:
    'Settings shell: section nav (NavList groups) on the left · a content column with the page title and form sections · a sticky save bar slot (Discard · Save changes). The current section is controllable with `value` / `onValueChange`; `href` items navigate as links and still report the change. Below `lg` the nav becomes a Select at the top of the page. Fills its container; `fullScreen` switches to `h-dvh`.',
  primitive: '@base-ui/react/select (small screens)',
  pattern: 'landmarks (labelled nav, main) + select-only combobox on small screens',
  keyboard: [
    ['Tab', 'Skip link, then the section nav items, then the content and the save bar'],
    ['Enter', 'Opens the focused section (aria-current="page" moves to it)'],
    ['Enter / Space / ↓ on the section Select', 'Small screens: opens the list; arrows move, Enter picks a section'],
  ],
  tokens: ['background', 'foreground', 'card', 'border', 'muted-foreground', 'primary', 'focus-ring'],
};
