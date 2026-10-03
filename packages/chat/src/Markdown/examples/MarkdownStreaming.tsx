import { Markdown } from '../Markdown';

/** A reply caught mid-stream: the open fence still renders as code, with the caret at the end. */
const PARTIAL = `Here is a script that lists every member of a project:

\`\`\`python
for member in client.members.list(project="web-app"):
    print(member.name, member.role)`;

export default function MarkdownStreaming() {
  return (
    <div className="max-w-2xl">
      <Markdown streaming>{PARTIAL}</Markdown>
    </div>
  );
}
