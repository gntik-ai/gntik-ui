import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useRegisteredHotkeys',
  status: 'stable',
  description:
    'useRegisteredHotkeys() returns a stable external-store snapshot of the shortcuts mounted through useHotkeys. Import useRegisteredHotkeys from @gntik-ai/ui/hooks. Each entry has hotkey, keys, then, description and group, so it can feed a shortcut sheet. The list changes as components mount and unmount and keeps its identity until a registration changes.',
  signature: 'useRegisteredHotkeys(): RegisteredHotkey[]',
  server: 'Returns an empty list, because no hotkey registers while rendering (`Registered: 0` in the example).',
};
