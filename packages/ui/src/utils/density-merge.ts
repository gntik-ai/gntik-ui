/**
 * Teaches tailwind-merge the density, typography and focus utilities from @gntik-ai/tokens, so
 * `cn('h-control', 'h-10')` and `px-control … px-0` resolve like any other Tailwind conflict.
 * Shared by `cn()` and the `tv()` instance.
 */
export const densityMergeConfig = {
  extend: {
    classGroups: {
      'focus-ring': ['focus-ring', 'focus-ring-inset'],
      z: [
        {
          z: [
            'behind',
            'base',
            'raised',
            'sticky',
            'sticky-pinned',
            'docked',
            'dropdown',
            'overlay',
            'modal',
            'popover',
            'skip-link',
            'toast',
            'tooltip',
          ],
        },
      ],
      'font-size': [
        {
          text: [
            'display',
            'heading-xl',
            'heading-lg',
            'heading-md',
            'heading-sm',
            'heading-xs',
            'heading-2xs',
            'body',
            'label',
            'supporting',
            'caption',
          ],
        },
      ],
      h: [{ h: ['control-sm', 'control', 'control-lg', 'item', 'tab', 'chip', 'token', 'row'] }],
      w: [{ w: ['control-sm', 'control', 'control-lg'] }],
      size: [{ size: ['control-sm', 'control', 'control-lg'] }],
      px: [{ px: ['control-sm', 'control', 'control-lg', 'field'] }],
      ps: [{ ps: ['field'] }],
      py: [{ py: ['cell', 'bar'] }],
      gap: [{ gap: ['tight'] }],
    },
  },
};
