import { PageHeader } from '@gntik-ai/blocks';
import { Alert, Checkbox, ClickableCard, Grid, GridItem, Page, Progress, Section, Stack, type BreadcrumbItem } from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { docLinks, setupInitialDone, setupTasks, startBreadcrumbs, type DocLink, type SetupTask } from './data';

export interface GettingStartedProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  tasks: readonly SetupTask[];
  /** Ids of the tasks already done (initial state). */
  defaultDone: readonly string[];
  /** Fires with every change of the done list. */
  onDoneChange: (done: string[]) => void;
  docs: readonly DocLink[];
  onDocOpen: (id: string) => void;
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Getting started: a setup checklist with progress, and cards linking to the docs. */
export default function GettingStartedPage({
  title = 'Get started',
  description = 'A few steps to set up your workspace. You can come back to this page at any time.',
  breadcrumbs = startBreadcrumbs,
  tasks = setupTasks,
  defaultDone = setupInitialDone,
  onDoneChange,
  docs = docLinks,
  onDocOpen,
  shell,
}: Partial<GettingStartedProps>) {
  const [done, setDone] = useState<string[]>(() => [...defaultDone]);
  const count = tasks.filter((t) => done.includes(t.id)).length;
  const percent = tasks.length ? Math.round((count / tasks.length) * 100) : 0;

  const toggle = (id: string, checked: boolean) => {
    const next = checked ? [...done.filter((d) => d !== id), id] : done.filter((d) => d !== id);
    setDone(next);
    onDoneChange?.(next);
  };

  return (
    <ConsoleShell currentHref="/overview" breadcrumbs={breadcrumbs} {...shell}>
      <Page header={<PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} actions={[]} tabs={null} />}>
        <Grid cols={{ base: 1, lg: 3 }} gap={6} align="start">
          <GridItem span={{ base: 1, lg: 2 }}>
            <Section variant="card" padding="lg" divided title="Setup checklist" description={`${count} of ${tasks.length} steps complete`}>
              <Progress value={percent} label="Setup progress" showValue tone={count === tasks.length ? 'success' : undefined} />
              {count === tasks.length && (
                <Alert tone="success" title="You’re all set" description="Your workspace is ready. Explore the docs to go further." />
              )}
              <Stack gap={4}>
                {tasks.map((task) => (
                  <Checkbox
                    key={task.id}
                    label={task.title}
                    description={task.description}
                    checked={done.includes(task.id)}
                    onCheckedChange={(checked) => toggle(task.id, checked)}
                  />
                ))}
              </Stack>
            </Section>
          </GridItem>
          <Section title="Learn more" description="Guides and reference for every step.">
            <Stack gap={3}>
              {docs.map((doc) => {
                const Icon = doc.icon;
                return (
                  <ClickableCard
                    key={doc.id}
                    title={doc.title}
                    description={doc.description}
                    href={doc.href}
                    icon={<Icon aria-hidden />}
                    onClick={() => onDocOpen?.(doc.id)}
                  />
                );
              })}
            </Stack>
          </Section>
        </Grid>
      </Page>
    </ConsoleShell>
  );
}
