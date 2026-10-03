import { PageHeader } from '@gntik-ai/blocks';
import { ArrowRight, Rss } from '@gntik-ai/icons';
import {
  Badge,
  Button,
  EmptyState,
  Heading,
  HStack,
  Link,
  Page,
  Stack,
  Text,
  Timestamp,
  Toggle,
  ToggleGroup,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { changelogBreadcrumbs, changelogEntries, changelogTagLabels, changelogTagTones, type ChangelogEntry, type ChangelogTag } from './data';

export interface ChangelogProps {
  title: string;
  description: string;
  /** Entries, newest first. */
  entries: ChangelogEntry[];
  /** Tags initially pressed; none = every entry. */
  defaultTags: ChangelogTag[];
  onTagsChange: (tags: ChangelogTag[]) => void;
  /** Subscribe action (RSS, email…); omit to hide it. */
  onSubscribe: (() => void) | null;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  shell: Omit<ConsoleShellProps, 'children'>;
}

const isTag = (v: string): v is ChangelogTag => v in changelogTagLabels;

/** Changelog: dated release entries with tag badges and a "New" badge, filtered by tag. */
export default function ChangelogPage(props: Partial<ChangelogProps>) {
  const {
    title = 'Changelog',
    description = 'New features, improvements and fixes, newest first.',
    entries = changelogEntries,
    defaultTags = [],
    onTagsChange,
    onSubscribe = () => {},
    breadcrumbs = changelogBreadcrumbs,
    currentHref = '/help/changelog',
    shell,
  } = props;
  const [tags, setTags] = useState<ChangelogTag[]>(defaultTags);
  const countId = useId();
  const tagsInUse = (Object.keys(changelogTagLabels) as ChangelogTag[]).filter((t) => entries.some((e) => e.tags.includes(t)));
  const visible = tags.length === 0 ? entries : entries.filter((e) => e.tags.some((t) => tags.includes(t)));

  const changeTags = (next: string[]) => {
    const valid = next.filter(isTag);
    setTags(valid);
    onTagsChange?.(valid);
  };

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={description}
            status=""
            meta={[]}
            tabs={null}
            actions={onSubscribe ? [{ label: 'Subscribe', icon: Rss, variant: 'secondary', onClick: onSubscribe }] : []}
          />
        }
      >
        <Stack gap={8}>
          <HStack gap={3} wrap>
            <ToggleGroup aria-label="Filter by tag" aria-describedby={countId} size="sm" multiple value={tags} onValueChange={changeTags}>
              {tagsInUse.map((t) => (
                <Toggle key={t} value={t}>
                  {changelogTagLabels[t]}
                </Toggle>
              ))}
            </ToggleGroup>
            {tags.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => changeTags([])}>
                Show all
              </Button>
            )}
            <Text id={countId} as="span" variant="caption" tone="muted" aria-live="polite">
              {visible.length === 1 ? '1 release' : `${visible.length} releases`}
            </Text>
          </HStack>
          {visible.length === 0 ? (
            <EmptyState size="sm" titleAs="h2" title="No releases with these tags" description="Pick another tag or show every release." />
          ) : (
            <ol aria-label="Releases" className="flex flex-col divide-y divide-border">
              {visible.map((e) => (
                <li key={e.id} className="grid gap-3 py-7 first:pt-0 md:grid-cols-[10rem_1fr] md:gap-8">
                  <Stack gap={1}>
                    <Timestamp value={e.date} format="absolute" tooltip={false} dateOptions={{ dateStyle: 'medium' }} className="text-[13px] font-medium text-foreground" />
                    <Text as="span" variant="caption" tone="muted" className="font-mono">
                      v{e.version}
                    </Text>
                  </Stack>
                  <article aria-labelledby={`${countId}-${e.id}`}>
                    <Stack gap={3}>
                      <HStack gap={2} wrap>
                        {e.isNew && (
                          <Badge tone="primary" variant="solid">
                            New
                          </Badge>
                        )}
                        {e.tags.map((t) => (
                          <Badge key={t} tone={changelogTagTones[t]}>
                            {changelogTagLabels[t]}
                          </Badge>
                        ))}
                      </HStack>
                      <Heading id={`${countId}-${e.id}`} level={2} size="sm">
                        {e.title}
                      </Heading>
                      <Text tone="muted">{e.summary}</Text>
                      <ul className="flex list-disc flex-col gap-1.5 ps-5 text-[13.5px] leading-6 text-foreground marker:text-muted-foreground">
                        {e.changes.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                      {e.href && (
                        <Link href={e.href} className="inline-flex items-center gap-1 self-start text-[13px]">
                          Read the release notes <ArrowRight size={14} aria-hidden />
                          <span className="sr-only"> for {e.version}</span>
                        </Link>
                      )}
                    </Stack>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </Stack>
      </Page>
    </ConsoleShell>
  );
}
