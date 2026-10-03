import { NoResultsEmpty, PageHeader, SectionHeader } from '@gntik-ai/blocks';
import { Search } from '@gntik-ai/icons';
import { Checkbox, CheckboxGroup, Grid, GridItem, Input, Kbd, Link, Page, Stack, useI18n, type BreadcrumbItem } from '@gntik-ai/ui';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  searchBreadcrumbs,
  searchDefaultQuery,
  searchFacets,
  searchHits,
  searchTypeLabels,
  searchTypeOrder,
  type SearchFacet,
  type SearchHit,
} from './data';

export type SearchSelection = Record<SearchFacet['id'], string[]>;

export interface SearchResultsProps {
  /** The index to search (a product passes its server results and keeps `query` in sync). */
  hits: SearchHit[];
  facets: SearchFacet[];
  defaultQuery: string;
  onQueryChange: (query: string) => void;
  onSelectionChange: (selection: SearchSelection) => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

const EMPTY_SELECTION: SearchSelection = { type: [], owner: [] };

const facetValue = (hit: SearchHit, facet: SearchFacet['id']) => (facet === 'type' ? hit.type : hit.owner);

/** Hits whose title or snippet contain the query (case-insensitive). */
export function matchQuery(hits: readonly SearchHit[], query: string) {
  const q = query.trim().toLowerCase();
  return q ? hits.filter((h) => `${h.title} ${h.snippet}`.toLowerCase().includes(q)) : [...hits];
}

/** Search results: ConsoleShell + Page with Checkbox-group facets and results grouped by type. */
export default function SearchResultsPage(props: Partial<SearchResultsProps>) {
  const { t } = useI18n();
  const {
    hits = searchHits,
    facets = searchFacets,
    defaultQuery = searchDefaultQuery,
    onQueryChange,
    onSelectionChange,
    breadcrumbs = searchBreadcrumbs,
    currentHref = '/search',
    shell,
  } = props;
  const id = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [selection, setSelection] = useState<SearchSelection>(EMPTY_SELECTION);

  const matched = matchQuery(hits, query);
  const results = matched.filter((h) =>
    (Object.keys(selection) as Array<SearchFacet['id']>).every((f) => selection[f].length === 0 || selection[f].includes(facetValue(h, f))),
  );
  const groups = searchTypeOrder.map((type) => ({ type, hits: results.filter((h) => h.type === type) })).filter((g) => g.hits.length > 0);
  const filterCount = selection.type.length + selection.owner.length;

  const changeQuery = (next: string) => {
    setQuery(next);
    onQueryChange?.(next);
  };
  const changeSelection = (next: SearchSelection) => {
    setSelection(next);
    onSelectionChange?.(next);
  };

  /** Arrow keys move through every result link; Home / End jump to the ends. */
  const focusResult = (move: 'first' | 'last' | 1 | -1) => {
    const links = Array.from(resultsRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-search-result]') ?? []);
    if (links.length === 0) return;
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = move === 'first' ? 0 : move === 'last' ? links.length - 1 : Math.min(links.length - 1, Math.max(0, at + move));
    links[next]?.focus();
  };
  const onResultsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, 'first' | 'last' | 1 | -1> = { ArrowDown: 1, ArrowUp: -1, Home: 'first', End: 'last' };
    const move = keys[e.key];
    if (move === undefined) return;
    e.preventDefault();
    focusResult(move);
  };

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title="Search"
            description="Projects, deployments, members and documents across the workspace."
            status=""
            meta={[]}
            tabs={null}
            actions={[]}
          />
        }
      >
        <div role="search" aria-label="Workspace search">
          <Input
            type="search"
            aria-label="Search the workspace"
            aria-describedby={`${id}-hint`}
            leadingIcon={Search}
            value={query}
            onValueChange={(v) => changeQuery(String(v))}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                focusResult('first');
              }
            }}
            placeholder={t('common.searchPlaceholder')}
            className="max-w-xl"
          />
          <p id={`${id}-hint`} className="mt-2 text-[12px] text-muted-foreground">
            <Kbd>↓</Kbd> moves into the results · <Kbd>↑</Kbd> <Kbd>↓</Kbd> step through them
          </p>
        </div>
        <Grid cols={{ base: 1, lg: 4 }} gap={6}>
          <GridItem as="aside" aria-label={t('filters.label')} span={{ base: 1, lg: 1 }}>
            <Stack gap={6}>
              {facets.map((facet) => (
                <div key={facet.id}>
                  <p id={`${id}-${facet.id}`} className="mb-2.5 font-mono text-[10.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                    {facet.label}
                  </p>
                  <CheckboxGroup
                    aria-labelledby={`${id}-${facet.id}`}
                    value={selection[facet.id]}
                    onValueChange={(value) => changeSelection({ ...selection, [facet.id]: value })}
                  >
                    {facet.options.map((o) => {
                      const count = matched.filter((h) => facetValue(h, facet.id) === o.value).length;
                      return (
                        <Checkbox
                          key={o.value}
                          name={facet.id}
                          value={o.value}
                          label={
                            <>
                              {o.label} <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
                            </>
                          }
                        />
                      );
                    })}
                  </CheckboxGroup>
                </div>
              ))}
            </Stack>
          </GridItem>
          <GridItem span={{ base: 1, lg: 3 }}>
            <p aria-live="polite" className="mb-4 text-[12.5px] text-muted-foreground">
              <span className="font-mono text-foreground tabular-nums">{results.length}</span> {results.length === 1 ? 'result' : 'results'}
              {query.trim() && (
                <>
                  {' '}
                  for “<span className="font-mono">{query.trim()}</span>”
                </>
              )}
            </p>
            {groups.length === 0 ? (
              <NoResultsEmpty
                titleAs="h2"
                entity="results"
                query={query.trim()}
                filterCount={filterCount}
                onClearFilters={() => changeSelection(EMPTY_SELECTION)}
                onClearSearch={() => changeQuery('')}
              />
            ) : (
              <div ref={resultsRef} onKeyDown={onResultsKey} className="flex flex-col gap-8">
                {groups.map((group) => {
                  const headingId = `${id}-group-${group.type}`;
                  return (
                    <section key={group.type} aria-labelledby={headingId}>
                      <SectionHeader headingId={headingId} title={searchTypeLabels[group.type]} count={group.hits.length} description={null} actions={[]} />
                      <ul aria-labelledby={headingId} className="mt-2 flex flex-col divide-y divide-border">
                        {group.hits.map((hit) => (
                          <li key={hit.id} className="py-3">
                            <Link underline="hover" data-search-result href={hit.href} className="text-[14px] font-semibold">
                              {hit.title}
                            </Link>
                            <p className="mt-0.5 text-[13px] text-muted-foreground">{hit.snippet}</p>
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                              {hit.meta} · {hit.owner}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </GridItem>
        </Grid>
      </Page>
    </ConsoleShell>
  );
}
