import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Assistant chat',
  family: 'AI',
  priority: 'P3',
  status: 'experimental',
  description: 'Workspace assistant in the console: @gntik-ai/chat ChatLayout with suggestions, ChatMessage turns, a ToolCallCard, a mock-streamed markdown reply with Citations, Stop / Retry / feedback and a ChatComposer; a details panel lists the context sources. Streaming timers are cleared on Stop and unmount.',
  layout: 'SidebarLayout · Page · ChatLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
