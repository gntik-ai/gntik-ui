import type { ChatAdapter, ChatChunk, CitationSource, Suggestion } from '@gntik-ai/chat';
import type { BreadcrumbItem } from '@gntik-ai/ui';

/** Mock tool call the assistant runs before answering. */
export interface AssistantTool {
  name: string;
  args: unknown;
  result: unknown;
  durationMs: number;
}

export const assistantSuggestions: Suggestion[] = [
  { label: 'Summarise this week’s deployments', description: 'What shipped across projects and what rolled back' },
  { label: 'Which invoices are still open?', description: 'Unpaid invoices from last month' },
  { label: 'Who has admin access?', description: 'Members with an admin role' },
  { label: 'Why did the last build fail?', description: 'Likely cause and a fix' },
];

export const assistantSources: CitationSource[] = [
  {
    title: 'Deployment history · web-app',
    url: 'https://app.example.com/projects/web-app/deployments',
    snippet: '14 deployments in the last 7 days, 1 rolled back.',
  },
  {
    title: 'Rollback guide',
    url: 'https://docs.example.com/deployments/rollback',
    snippet: 'Roll back from the Deployments page or with the CLI.',
  },
  {
    title: 'Health checks',
    url: 'https://docs.example.com/deployments/health-checks',
    snippet: 'A deployment is promoted only after every region reports healthy.',
  },
];

export const assistantTool: AssistantTool = {
  name: 'list_deployments',
  args: { project: 'web-app', since: '7d' },
  result: { count: 14, succeeded: 13, rolledBack: 1, latest: 'v3.2.0' },
  durationMs: 600,
};

export const assistantReply = `This week **web-app** shipped 14 deployments:

| Status | Count |
| --- | --- |
| Succeeded | 13 |
| Rolled back | 1 |

The rollback was \`v3.1.4\`: its health check failed in one region, so traffic stayed on the previous build.

To pin the current release from the CLI:

\`\`\`bash
deploy pin --project web-app --version v3.2.0
\`\`\`

The [rollback guide](https://docs.example.com/deployments/rollback) has the full steps.`;

export const assistantBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Acme Industries', href: '/overview' },
  { label: 'Assistant' },
];

/** Splits text into small chunks to imitate token streaming. */
export function chunkReply(text: string, size = 6): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

/** Demo-only backend substitute. All chunk timers are scheduled eagerly and cleared on abort. */
export function createScriptedAdapter(
  reply: string,
  tool: AssistantTool,
  tickMs: number,
  sources: CitationSource[],
): ChatAdapter {
  return {
    async sendMessage({ signal }) {
      const timers = new Set<ReturnType<typeof setTimeout>>();
      let close: (() => void) | undefined;
      const clear = () => {
        timers.forEach(clearTimeout);
        timers.clear();
        signal.removeEventListener('abort', abort);
      };
      const abort = () => {
        clear();
        close?.();
        close = undefined;
      };
      return new ReadableStream<ChatChunk>({
        start(controller) {
          close = () => controller.close();
          if (signal.aborted) {
            abort();
            return;
          }
          signal.addEventListener('abort', abort, { once: true });
          const later = (chunk: ChatChunk, ms: number) => {
            const timer = setTimeout(() => {
              timers.delete(timer);
              controller.enqueue(chunk);
              if (chunk.type === 'finish') {
                clear();
                close?.();
                close = undefined;
              }
            }, ms);
            timers.add(timer);
          };
          controller.enqueue({ type: 'start' });
          controller.enqueue({
            type: 'tool-input-available',
            toolCallId: 'scripted-tool',
            toolName: tool.name,
            input: tool.args,
          });
          later({ type: 'tool-output-available', toolCallId: 'scripted-tool', output: tool.result }, tool.durationMs);
          const pieces = chunkReply(reply);
          pieces.forEach((delta, i) =>
            later({ type: 'text-delta', id: 'reply', delta }, tool.durationMs + (i + 1) * tickMs),
          );
          const end = tool.durationMs + (pieces.length + 1) * tickMs;
          sources.forEach((source, i) =>
            later({ type: 'source-url', sourceId: String(i), title: source.title, url: source.url ?? '' }, end),
          );
          later({ type: 'finish' }, end);
        },
        cancel() {
          clear();
          close = undefined;
        },
      });
    },
  };
}
