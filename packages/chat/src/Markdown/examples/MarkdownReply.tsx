import { Markdown } from '../Markdown';

const REPLY = `## Rolling back a deployment

You can roll back from the **Deployments** page or from the CLI. The previous build stays cached for 7 days.

1. Open the project and pick the deployment.
2. Choose *Roll back* and confirm.
3. Watch the health checks until every region is green.

| Region | Status | Latency |
| --- | --- | --- |
| eu-west | Healthy | 42 ms |
| us-east | Degraded | 180 ms |

> Rolling back does not revert database migrations.

Run \`deploy rollback --to previous\` or script it:

\`\`\`ts
await client.deployments.rollback({ project: 'web-app', to: 'previous' });
\`\`\`

- [x] Notify the team
- [ ] Update the incident log

See the [rollback guide](https://example.com/docs/rollback) for details.`;

export default function MarkdownReply() {
  return (
    <div className="max-w-2xl">
      <Markdown>{REPLY}</Markdown>
    </div>
  );
}
