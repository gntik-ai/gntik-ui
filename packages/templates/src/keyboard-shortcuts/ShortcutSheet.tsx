import { Keyboard, Search } from '@gntik-ai/icons';
import { EmptyState, Grid, Heading, Input, KbdCombo, Stack, Text } from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { filterShortcuts, type ShortcutGroup } from './data';

export interface ShortcutSheetProps {
  groups: readonly ShortcutGroup[];
  /** Heading level of the group titles (h2 on the page, h3 inside the dialog). */
  headingLevel?: 2 | 3;
  /** Columns of groups at `md` and up. */
  columns?: 1 | 2;
  autoFocus?: boolean;
}

/** Searchable shortcut sheet shared by the page and the dialog. */
export function ShortcutSheet({ groups, headingLevel = 2, columns = 2, autoFocus }: ShortcutSheetProps) {
  const [query, setQuery] = useState('');
  const countId = useId();
  const visible = filterShortcuts(groups, query);
  const total = visible.reduce((n, g) => n + g.shortcuts.length, 0);
  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Input
          type="search"
          aria-label="Search shortcuts"
          aria-describedby={countId}
          placeholder="Search shortcuts…"
          leadingIcon={Search}
          value={query}
          onValueChange={setQuery}
          autoFocus={autoFocus}
          className="max-w-md"
        />
        <Text id={countId} variant="caption" tone="muted" aria-live="polite">
          {total === 1 ? '1 shortcut' : `${total} shortcuts`}
        </Text>
      </Stack>
      {visible.length === 0 ? (
        <EmptyState icon={Keyboard} size="sm" titleAs={headingLevel === 2 ? 'h2' : 'h3'} title="No shortcuts match" description="Try another word, such as “save” or “go to”." />
      ) : (
        <Grid cols={{ base: 1, md: columns }} gap={6}>
          {visible.map((g) => (
            <section key={g.id} aria-labelledby={`${countId}-${g.id}`}>
              <Heading id={`${countId}-${g.id}`} level={headingLevel} size="xs" className="mb-2">
                {g.title}
              </Heading>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {g.shortcuts.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-4 px-3.5 py-2.5">
                    <Text as="span" variant="supporting">
                      {s.description}
                    </Text>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <KbdCombo keys={s.keys} />
                      {s.then && (
                        <>
                          <Text as="span" variant="caption" tone="muted">
                            then
                          </Text>
                          <KbdCombo keys={s.then} />
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
