/**
 * Teaches tailwind-merge the density utilities from @gntik-ai/tokens (density.css), so
 * `cn('h-control', 'h-10')` and `px-control … px-0` resolve like any other Tailwind conflict.
 * Shared by `cn()` and the `tv()` instance.
 */
export const densityMergeConfig = {
  extend: {
    classGroups: {
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
