import { AssistantChatPage } from '@gntik-ai/templates';
import { assistantReply, assistantSources, assistantSuggestions, assistantTool } from '../data/assistant';
import { currentWorkspace } from '../data/workspace';

export function Assistant() {
  return (
    <AssistantChatPage
      title="Assistant"
      suggestions={assistantSuggestions}
      sources={assistantSources}
      tool={assistantTool}
      reply={assistantReply}
      breadcrumbs={[{ label: currentWorkspace.name, href: '/' }, { label: 'Assistant' }]}
      currentHref="/assistant"
    />
  );
}
