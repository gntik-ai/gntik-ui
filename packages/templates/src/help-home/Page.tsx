import { Clock, Search } from '@gntik-ai/icons';
import {
  Badge,
  ClickableCard,
  DocsLayout,
  EmptyState,
  Grid,
  Heading,
  Input,
  Link,
  Logo,
  NavList,
  Stack,
  Text,
  ThemeSwitcher,
  type NavGroup,
} from '@gntik-ai/ui';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { helpArticles, helpCategories, helpNav, searchArticles, type HelpArticle, type HelpCategory } from './data';

export interface HelpHomeProps {
  /** Logo or product name in the top bar. */
  brand: ReactNode;
  title: string;
  description: string;
  nav: NavGroup[];
  currentHref: string;
  categories: HelpCategory[];
  /** Popular articles; the search filters them client-side unless `onSearch` handles it. */
  articles: HelpArticle[];
  /** Enter in the search field (server-side search). */
  onSearch: (query: string) => void;
  /** Text under the popular articles (contact support…). */
  footer: ReactNode;
}

/** Help center home on DocsLayout: search, category cards and popular articles. */
export default function HelpHomePage(props: Partial<HelpHomeProps>) {
  const {
    brand = <Logo size={22} wordmark />,
    title = 'How can we help?',
    description = 'Guides, answers and troubleshooting for your workspace.',
    nav = helpNav,
    currentHref = '/help',
    categories = helpCategories,
    articles = helpArticles,
    onSearch,
    footer = (
      <Text variant="supporting" tone="muted">
        Can’t find what you need? <Link href="/help/support">Contact support</Link>.
      </Text>
    ),
  } = props;
  const [query, setQuery] = useState('');
  const ids = useId();
  const results = searchArticles(articles, query);
  const searching = query.trim() !== '';
  const categoryTitle = (id: string) => categories.find((c) => c.id === id)?.title ?? id;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <DocsLayout
      fullScreen
      header={
        <>
          {brand}
          <Badge tone="neutral" size="sm">
            Help
          </Badge>
          <ThemeSwitcher size="sm" className="ms-auto" />
        </>
      }
      nav={<NavList label="Help center" groups={nav} currentHref={currentHref} />}
      footer={footer}
    >
      <Stack gap={10}>
        <Stack gap={4}>
          <Heading level={1} size="xl">
            {title}
          </Heading>
          <Text tone="muted">{description}</Text>
          <form role="search" aria-label="Help articles" onSubmit={submit} className="max-w-xl">
            <Input
              type="search"
              aria-label="Search help articles"
              aria-describedby={`${ids}-count`}
              placeholder="Search articles…"
              leadingIcon={Search}
              value={query}
              onValueChange={setQuery}
            />
          </form>
        </Stack>

        {!searching && (
          <section aria-labelledby={`${ids}-categories`}>
            <Heading id={`${ids}-categories`} level={2} size="sm" className="mb-4">
              Browse by topic
            </Heading>
            <Grid cols={{ base: 1, md: 2 }} gap={3}>
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <ClickableCard
                    key={c.id}
                    href={c.href}
                    titleAs="h3"
                    icon={<Icon aria-hidden />}
                    title={c.title}
                    description={c.description}
                    meta={<span>{c.articleCount} articles</span>}
                  />
                );
              })}
            </Grid>
          </section>
        )}

        <section aria-labelledby={`${ids}-articles`}>
          <Heading id={`${ids}-articles`} level={2} size="sm" className="mb-1">
            {searching ? 'Search results' : 'Popular articles'}
          </Heading>
          <Text id={`${ids}-count`} variant="caption" tone="muted" aria-live="polite" className="mb-3 block">
            {searching ? (results.length === 1 ? '1 article' : `${results.length} articles`) : ''}
          </Text>
          {results.length === 0 ? (
            <EmptyState icon={Search} size="sm" titleAs="h3" title="No articles match" description="Try fewer words, or contact support." />
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {results.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 px-4 py-3.5">
                  <Link href={a.href} className="self-start text-[14px] font-medium">
                    {a.title}
                  </Link>
                  <Text variant="supporting" tone="muted">
                    {a.excerpt}
                  </Text>
                  <Text as="span" variant="caption" tone="muted" className="inline-flex items-center gap-1.5">
                    {categoryTitle(a.category)} · <Clock size={12} aria-hidden /> {a.minutes} min read
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Stack>
    </DocsLayout>
  );
}
