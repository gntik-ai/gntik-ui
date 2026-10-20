import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Kbd',
  group: 'Display',
  status: 'stable',
  description:
    'Keyboard key chip (<kbd>) for shortcuts and hints, in three sizes. Use mod in Kbd or KbdCombo for ⌘ on macOS/iOS and Ctrl elsewhere; explicit keys stay unchanged. Symbol keys and Ctrl are announced by name, unless label overrides the spoken name. useOs() reports the detected OS (undetermined during SSR); getOs() detects it outside React. Both and the Os type are exported from @gntik-ai/ui.',
  tokens: ['border', 'card', 'muted-foreground'],
};
