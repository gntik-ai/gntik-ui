import { Markdown } from '@gntik-ai/chat';
import { Breadcrumbs, DocsLayout } from '@gntik-ai/ui';

const TOC = [
  { id: 'prerequisites', label: 'Prerequisites' },
  { id: 'configure', label: 'Configure the project' },
  { id: 'ship', label: 'Ship it' },
];

const ARTICLE = `# Deploy a project

## Prerequisites

A repository and an account with deploy access.

## Configure the project

Pick a region and set the environment variables.

## Ship it

Push to the default branch.`;

export default function DocsArticle() {
  return (
    <DocsLayout toc={TOC}>
      <Breadcrumbs items={[{ label: 'Docs', href: '/docs' }, { label: 'Deploy a project' }]} />
      <Markdown>{ARTICLE}</Markdown>
    </DocsLayout>
  );
}
