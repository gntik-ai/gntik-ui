// Install the optional peer: pnpm add shiki
import { useMemo } from 'react';
import { createShikiHighlighter } from '../../../code-highlight-shiki';
import { CodeBlock } from '../CodeBlock';
import { CodeHighlighterProvider } from '../CodeHighlighterProvider';

const YAML = 'name: "api"\nreplicas: 2';
const PYTHON = 'def greet():\n    """First line\n    Second line\n    Third line"""\n    return True';
const GO = 'package main\n\nfunc main() {\n    println("ready")\n}';
const SQL = 'SELECT name\nFROM services\nWHERE active = true;';

export default function CodeBlockHighlighter() {
  const highlighter = useMemo(
    () =>
      createShikiHighlighter({
        languages: { yaml: () => import('shiki/langs/yaml.mjs').then((module) => module.default) },
      }),
    [],
  );
  return (
    <CodeHighlighterProvider highlighter={highlighter}>
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <CodeBlock filename="service.yaml" language="yaml" code={YAML} showLineNumbers maxHeight={240} />
        <CodeBlock filename="greeting.py" language="python" code={PYTHON} showLineNumbers maxHeight={240} />
        <CodeBlock filename="main.go" language="go" code={GO} showLineNumbers maxHeight={240} />
        <CodeBlock filename="services.sql" language="sql" code={SQL} showLineNumbers maxHeight={240} />
      </div>
    </CodeHighlighterProvider>
  );
}
