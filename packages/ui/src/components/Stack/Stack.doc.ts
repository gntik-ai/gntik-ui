import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Stack',
  group: 'Layout',
  status: 'stable',
  description:
    'Flex layout primitives: Stack (any direction), HStack, VStack and Center. Responsive direction, gap, align, justify and wrap, plus padding, paddingInline and paddingBlock on the 0–12 spacing scale. Mobile-first objects use base, sm, md, lg, xl and 2xl; omitted base direction defaults to column and wrap to nowrap. Other omitted base values add no class; HStack centres only when align is undefined. HStack and VStack keep their fixed direction and reverse; single values keep their existing classes. Also supports inline; render as any block tag with `as`, or any element with `render`. Paints nothing.',
  primitive: '@base-ui/react/use-render',
  tokens: [],
};
