import { InlineCallout } from '@gntik-ai/blocks';
import { ArrowLeft, ArrowRight } from '@gntik-ai/icons';
import {
  Badge,
  Blockquote,
  Breadcrumbs,
  CodeBlock,
  DocsLayout,
  HStack,
  Link,
  Logo,
  NavList,
  Stack,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  ThemeSwitcher,
  Timestamp,
  type BreadcrumbItem,
  type NavGroup,
  type OutlineItem,
} from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { ArticleFeedback, type ArticleFeedbackValue } from './ArticleFeedback';
import { articleBreadcrumbs, articleNext, articlePrev, articleToc, docsNav, signatureHeaders, verifyCode, type ArticleLink } from './data';

export interface DocsArticleProps {
  brand: ReactNode;
  nav: NavGroup[];
  currentHref: string;
  /** Location trail above the title; `null` hides it. */
  breadcrumbs: BreadcrumbItem[] | null;
  eyebrow: string;
  title: string;
  lead: ReactNode;
  updatedAt: string;
  /** Table of contents; ids must match the headings of `children`. */
  toc: OutlineItem[];
  /** Article body; defaults to the sample “Verify webhook signatures” guide. */
  children: ReactNode;
  prev: ArticleLink | null;
  next: ArticleLink | null;
  onFeedback: (value: ArticleFeedbackValue) => void;
}

const P = 'text-[14px] leading-7 text-muted-foreground';
const H2 = 'mt-10 mb-3 scroll-mt-6 text-[18px] font-semibold tracking-tight text-foreground';
const CODE = 'rounded-sm bg-secondary px-1 py-0.5 font-mono text-[0.92em] text-foreground';
const H3 = 'mt-6 mb-2 scroll-mt-6 text-[15px] font-semibold text-foreground';

function SampleBody() {
  return (
    <>
      <h2 id="how-it-works" className={H2}>
        How signing works
      </h2>
      <p className={P}>
        Every delivery carries a <code className={CODE}>Signature</code> header: a
        timestamp and an HMAC-SHA256 of the timestamp and the raw body, keyed with the endpoint secret. You find the secret on the
        endpoint page; see <Link href="/docs/webhooks/create">Create a webhook</Link> if you have not added one yet.
      </p>
      <div className="my-5 overflow-hidden rounded-lg border border-border bg-card">
        <Table density="compact" containerLabel="Delivery headers">
          <TableCaption srOnly>Headers sent with every delivery</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Example</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signatureHeaders.map((h) => (
              <TableRow key={h.name}>
                <TableCell className="font-mono text-[12.5px] text-foreground">{h.name}</TableCell>
                <TableCell className="font-mono text-[12px] text-muted-foreground">{h.example}</TableCell>
                <TableCell>{h.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <h2 id="verify" className={H2}>
        Verify a signature
      </h2>
      <p className={P}>Compute the same HMAC on your side and compare it in constant time. Use the raw body, before any JSON parsing.</p>
      <h3 id="verify-node" className={H3}>
        Node.js example
      </h3>
      <CodeBlock code={verifyCode} language="ts" filename="verify.ts" showLineNumbers />
      <h2 id="replay" className={H2}>
        Reject replayed events
      </h2>
      <p className={P}>Refuse deliveries whose timestamp is more than five minutes old, and store the ids of the events you processed.</p>
      <Blockquote source="Security review" sourceDetail="Platform team" className="my-5">
        A valid signature proves who sent the event, not when. Always check the timestamp too.
      </Blockquote>
      <h2 id="rotate" className={H2}>
        Rotate the secret
      </h2>
      <p className={P}>Rolling a secret keeps the old one valid for 24 hours, so you can deploy the new value without dropping deliveries.</p>
      <InlineCallout className="mt-4" tone="info" title="Tip" description="Store the secret in an environment variable, never in the repository." />
    </>
  );
}

/** Documentation article on DocsLayout: nav, breadcrumbs, scroll-spy Outline, table, code, quote, prev/next and feedback. */
export default function DocsArticlePage(props: Partial<DocsArticleProps>) {
  const {
    brand = <Logo size={22} wordmark />,
    nav = docsNav,
    currentHref = '/docs/webhooks',
    breadcrumbs = articleBreadcrumbs,
    eyebrow = 'Guides · Webhooks',
    title = 'Verify webhook signatures',
    lead = 'Check that each delivery comes from us and has not been replayed before you act on it.',
    updatedAt = '2026-09-21',
    toc = articleToc,
    children = <SampleBody />,
    prev = articlePrev,
    next = articleNext,
    onFeedback,
  } = props;
  return (
    <DocsLayout
      fullScreen
      header={
        <>
          {brand}
          <Badge tone="neutral" size="sm">
            Docs
          </Badge>
          <ThemeSwitcher size="sm" className="ms-auto" />
        </>
      }
      nav={<NavList label="Documentation" groups={nav} currentHref={currentHref} />}
      toc={toc}
      footer={
        <Stack gap={6}>
          <ArticleFeedback onFeedback={onFeedback} />
          {(prev || next) && (
            <nav aria-label="Previous and next articles">
              <HStack justify="between" gap={4} className="text-[13px]">
                {prev ? (
                  <Link href={prev.href} className="inline-flex items-center gap-1.5">
                    <ArrowLeft size={14} aria-hidden /> <span className="sr-only">Previous: </span>
                    {prev.label}
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link href={next.href} className="inline-flex items-center gap-1.5">
                    <span className="sr-only">Next: </span>
                    {next.label} <ArrowRight size={14} aria-hidden />
                  </Link>
                )}
              </HStack>
            </nav>
          )}
        </Stack>
      }
    >
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
      <p className="font-mono text-[11px] tracking-[0.18em] text-primary-text uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-foreground">{title}</h1>
      <p className={`mt-3 ${P}`}>{lead}</p>
      <Text variant="caption" tone="muted" className="mt-2">
        Updated <Timestamp value={updatedAt} format="absolute" tooltip={false} dateOptions={{ dateStyle: 'medium' }} />
      </Text>
      {children}
    </DocsLayout>
  );
}
