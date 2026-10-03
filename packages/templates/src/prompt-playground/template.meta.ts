import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Prompt playground',
  family: 'AI',
  priority: 'P3',
  status: 'experimental',
  description:
    'Prompt playground inside the console (CanvasLayout embedded in ConsoleShell, so the app nav stays): shared variables in a ListInput palette, the PromptEditor, and 2–3 model columns side by side with a Diff switch that compares each column against the first in a DiffEditor.',
  layout: 'CanvasLayout',
  blocks: ['app-sidebar', 'app-topbar', 'prompt-editor'],
};
