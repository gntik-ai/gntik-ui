import type { CitationSource } from '../Citation';
import type { Suggestion } from '../SuggestionChips';

/** Fixtures for ChatDemo: generic workspace data, no product names. */
export const DEMO_SUGGESTIONS: Suggestion[] = [
  { label: 'Summarise deployments', description: 'What shipped this week across projects' },
  { label: 'Find unpaid invoices', description: 'Invoices still open from last month' },
  { label: 'Review member access', description: 'Who has admin rights' },
  { label: 'Explain a failed build', description: 'Likely cause and a fix' },
];

export const DEMO_SOURCES: CitationSource[] = [
  { title: 'Deployment history · web-app', url: 'https://app.example.com/projects/web-app/deployments', snippet: '12 deployments in the last 7 days, 1 rolled back.' },
  { title: 'Rollback guide', url: 'https://docs.example.com/deployments/rollback', snippet: 'Roll back from the Deployments page or with the CLI.' },
];

export const DEMO_TOOL = {
  name: 'list_deployments',
  args: { project: 'web-app', since: '7d' },
  result: { count: 12, succeeded: 11, rolledBack: 1, latest: 'v2.14.0' },
  durationMs: 640,
};

export const DEMO_REPLY = `Here is the summary for **web-app** over the last 7 days:

| Status | Count |
| --- | --- |
| Succeeded | 11 |
| Rolled back | 1 |

The rollback was \`v2.13.2\`: a health check failed in one region, so traffic went back to the previous build.

To pin a release from the CLI:

\`\`\`bash
deploy pin --project web-app --version v2.14.0
\`\`\`

See the [rollback guide](https://docs.example.com/deployments/rollback) for the full steps.`;

/** Splits text into small chunks to imitate token streaming. */
export function chunk(text: string, size = 6): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}
