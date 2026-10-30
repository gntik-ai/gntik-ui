import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'ChoiceCard',
  group: 'Forms',
  status: 'beta',
  anatomy: `<SelectableCardGroup aria-label="Options" defaultValue="option">
  <SelectableCard value="option" title="Option" description="Option details." />
</SelectableCardGroup>`,
  description:
    'Cards as controls. ClickableCard: the whole card is one link or button (a stretched title, so there is a single focus target with a short name) with icon, description, meta and a chevron. SelectableCard inside SelectableCardGroup: option cards with radio (single) or checkbox (multiple) semantics on Base UI RadioGroup / CheckboxGroup, with a check indicator, title, description, meta and disabled state.',
  primitive: '@base-ui/react/radio-group · @base-ui/react/checkbox-group',
  pattern: 'link / button · radiogroup · group of checkboxes',
  keyboard: [
    [
      'Tab',
      'ClickableCard: focuses its link or button. Group: enters the radio group once, on the selected card; visits each checkbox card',
    ],
    ['Enter', 'Activates a ClickableCard'],
    ['Arrow keys', 'Radio group: move to the next / previous card and select it'],
    ['Space', 'Checkbox group: toggles the focused card (radio: selects it)'],
  ],
  dataAttributes: [
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-checked', 'root', 'The control is checked.'],
    ['data-checked', 'control', 'The control is checked.'],
    ['data-unchecked', 'indicator', 'The control is unchecked.'],
  ],
  tokens: [
    'background',
    'border',
    'secondary',
    'foreground',
    'muted-foreground',
    'primary',
    'primary-foreground',
    'focus-ring',
  ],
};
