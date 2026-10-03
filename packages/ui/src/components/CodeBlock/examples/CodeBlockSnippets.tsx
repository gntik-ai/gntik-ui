import { Code } from '../Code';
import { CodeBlock } from '../CodeBlock';

const INSTALL = 'pnpm add @gntik-ai/ui @gntik-ai/tokens # components + brand tokens';
const CONFIG = `{
  "project": "atlas",
  "regions": ["eu-west", "us-east"],
  "replicas": 3,
  "public": false
}`;
const CSS = `@import "@gntik-ai/tokens/brand.css";

.invoice-total {
  font-weight: 600;
  margin-top: 0.75rem;
}`;

export default function CodeBlockSnippets() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        Install the packages, then import <Code>@gntik-ai/ui/styles.css</Code> once at the root.
      </p>
      <CodeBlock language="bash" code={INSTALL} wrapToggle={false} />
      <CodeBlock filename="deploy.json" language="json" code={CONFIG} />
      <CodeBlock filename="invoice.css" language="css" code={CSS} defaultWrap />
    </div>
  );
}
