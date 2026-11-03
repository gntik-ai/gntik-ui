import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useFitCount',
  status: 'stable',
  description:
    'Counts how many leading items fit in a container, measuring an off-screen copy whose last child is the "+N" trigger template. Import useFitCount from @gntik-ai/ui/hooks. It re-measures with a ResizeObserver, honours right-to-left layout and returns undefined until measured or while disabled. OverflowList is built on it; use the hook directly for custom overflow rows.',
  signature: 'useFitCount(enabled, container, measure, count): number | undefined',
  server:
    'Returns undefined, so every item renders until the browser measures (`Visible items: 6 of 6` in the example).',
};
