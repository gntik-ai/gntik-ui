import type { CitationSource, Suggestion } from '@gntik-ai/chat';

export const assistantSuggestions: Suggestion[] = [
  { label: 'Why is research-scout degraded?', description: 'Likely cause and what to change' },
  { label: 'Which agents cost the most this month?', description: 'Spend by agent, month to date' },
  { label: 'Summarise yesterday’s failed runs', description: 'Grouped by agent and error' },
  { label: 'Is support-triage v13 safe to promote?', description: 'Compare the evaluation with v12' },
];

export const assistantSources: CitationSource[] = [
  { title: 'Fleet monitor · market-intel', url: 'https://app.musematic.ai/fleet/market-intel', snippet: 'web.fetch p95 6.9 s over the last 6 hours (SLO 4 s).' },
  { title: 'Run trace · run_10cm', url: 'https://app.musematic.ai/runs/run_10cm', snippet: 'tool: web.fetch timed out twice before the retry succeeded.' },
  { title: 'Tool timeouts guide', url: 'https://docs.musematic.ai/agents/tools/timeouts', snippet: 'Raise the per-tool timeout or add a cache in front of slow sources.' },
];

export const assistantTool = {
  name: 'get_fleet_health',
  args: { fleet: 'market-intel', window: '6h' },
  result: { status: 'degraded', p95Ms: 6900, sloMs: 4000, slowestTool: 'web.fetch', timeouts: 212 },
  durationMs: 600,
};

export const assistantReply = `**research-scout** is degraded because its \`web.fetch\` tool is slow, not because of the model:

| Signal | Last 6 h | SLO |
| --- | --- | --- |
| p95 latency | 6.9 s | 4 s |
| Tool timeouts | 212 | — |
| Model errors | 0 | — |

Most timeouts hit two news sources that started rate-limiting at 09:40. Raise the tool timeout and add the cache:

\`\`\`yaml
tools:
  web.fetch:
    timeout_ms: 8000
    cache_ttl: 15m
\`\`\`

The [tool timeouts guide](https://docs.musematic.ai/agents/tools/timeouts) has the details.`;
