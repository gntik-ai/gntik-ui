import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Avatar',
  group: 'Display',
  status: 'stable',
  description:
    'Person or entity avatar: image with an initials (or icon) fallback, five sizes (xs–xl), round or rounded, tinted tones and an optional presence dot. AvatarGroup stacks avatars with a "+N more" overflow.',
  primitive: '@base-ui/react/avatar',
  pattern: 'img',
  anatomy: `<AvatarGroup>
  <Avatar name="Alex Morgan" />
  <Avatar name="Sam Rivera" />
</AvatarGroup>`,
  dataAttributes: [
    ['data-error', 'image', 'The operation has failed.'],
    ['data-loading', 'image', 'The operation is loading.'],
  ],
  tokens: [
    'primary',
    'primary-foreground',
    'accent',
    'secondary',
    'category-violet',
    'category-cyan',
    'category-amber',
    'category-rose',
    'success',
    'warning',
    'destructive',
    'card',
  ],
};
