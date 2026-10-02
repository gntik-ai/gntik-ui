import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Link',
  group: 'Navigation',
  status: 'stable',
  description:
    'Styled anchor in brand green with an underline on hover. `external` adds the external icon, a hidden "opens in a new tab" hint and safe rel/target. LinkProvider supplies the app router link so internal links navigate client-side; `render` swaps the element per link.',
  primitive: '@base-ui/react/use-render',
  pattern: 'link',
  keyboard: [
    ['Enter', 'Follows the link'],
    ['Tab', 'Moves focus to and from the link'],
  ],
  tokens: ['primary-text', 'muted-foreground', 'foreground', 'focus-ring'],
};
