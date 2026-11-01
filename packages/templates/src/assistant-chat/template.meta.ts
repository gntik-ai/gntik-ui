import type { TemplateMeta } from '../meta';

export const meta: TemplateMeta = {
  name: 'Assistant chat',
  family: 'AI',
  priority: 'P3',
  status: 'experimental',
  description:
    'Workspace assistant in the console: @gntik-ai/chat ChatLayout with suggestions, ChatMessage turns, a ToolCallCard, adapter-streamed markdown replies with Citations, Stop / Retry / feedback and a ChatComposer; a details panel lists the context sources. Pass an optional adapter for a backend, or use the scripted demo; Stop and unmount abort both.',
  layout: 'SidebarLayout · Page · ChatLayout',
  blocks: ['app-sidebar', 'app-topbar', 'page-header'],
};
