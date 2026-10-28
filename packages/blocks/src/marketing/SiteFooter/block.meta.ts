import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Site footer',
  family: 'marketing',
  status: 'beta',
  description:
    'Public footer with columns, centered and simple layouts. Optional brand, description, newsletter slot, legal and social links, and an icon-only theme switcher at every width. Uses a div by default inside a layout footer; opt into landmark for standalone pages. Empty groups stay absent; navigation names use the English/Spanish catalog or navLabel. Social labels must name the network. Simple mode preserves inherited typography and the public templates’ spacing.',
  uses: ['Link', 'Logo', 'IconButton', 'ThemeSwitcher'],
};
