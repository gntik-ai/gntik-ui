import type { CitationSource, Suggestion } from '@gntik-ai/chat';
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
  { title: 'Deployment history · web-app', url: 'https://app.example.com/projects/web-app/deployments', snippet: '14 deployments in the last 7 days, 1 rolled back.' },
  { title: 'Rollback guide', url: 'https://docs.example.com/deployments/rollback', snippet: 'Roll back from the Deployments page or with the CLI.' },
  { title: 'Health checks', url: 'https://docs.example.com/deployments/health-checks', snippet: 'A deployment is promoted only after every region reports healthy.' },
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

export const assistantBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Assistant' }];

/** Splits text into small chunks to imitate token streaming. */
export function chunkReply(text: string, size = 6): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}
