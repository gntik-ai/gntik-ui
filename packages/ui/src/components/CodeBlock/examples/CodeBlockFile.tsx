import { CodeBlock } from '../CodeBlock';

const SOURCE = `import { Button } from '@gntik-ai/ui';

// Ships the current project to production.
export function DeployButton({ project }: { project: string }) {
  const label = \`Deploy \${project}\`;
  return (
    <Button variant="primary" onClick={() => deploy(project, { retries: 3 })}>
      {label}
    </Button>
  );
}
`;

export default function CodeBlockFile() {
  return (
    <CodeBlock
      className="w-full max-w-2xl"
      filename="DeployButton.tsx"
      language="tsx"
      code={SOURCE}
      showLineNumbers
      highlightLines={[5, 7]}
      maxHeight={320}
    />
  );
}
