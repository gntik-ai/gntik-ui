import { PageHeader } from '@gntik-ai/blocks';
import { AuthLayout, Badge, Button, Card, CardTitle, Grid, Link, Separator, Skeleton, Text } from '@gntik-ai/ui';
import { useId, type MouseEventHandler, type ReactNode } from 'react';
import { publicHubCopy } from './data';

export interface PublicHubAction {
  label: string;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface PublicHubPageProps {
  eyebrow?: string;
  title: string;
  description?: string;
  cards?: { title: string; body: string }[];
  primaryAction: PublicHubAction;
  secondaryAction?: PublicHubAction;
  tertiaryLink?: PublicHubAction;
  footer?: string;
  loading?: boolean;
  logo?: ReactNode;
  loadingLabel?: string;
}

/** Unauthenticated entry hub; optional content stays absent unless supplied. */
export default function PublicHubPage({
  eyebrow,
  title = publicHubCopy.title,
  description,
  cards,
  primaryAction = publicHubCopy.primaryAction,
  secondaryAction,
  tertiaryLink,
  footer,
  logo,
  loading = false,
  loadingLabel = 'Loading',
}: Partial<PublicHubPageProps>) {
  const titleId = useId();
  return (
    <AuthLayout variant="full-bleed" fullScreen logo={logo} skipLinkLabel="Skip to main content">
      <section
        aria-labelledby={loading ? undefined : titleId}
        aria-label={loading ? loadingLabel : undefined}
        aria-busy={loading || undefined}
        className="flex min-w-0 flex-col gap-6 break-words"
      >
        {eyebrow && (loading ? <Skeleton className="h-5 w-24" /> : <Badge className="self-start">{eyebrow}</Badge>)}
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-2/3" />
            {description && <Skeleton shape="text" lines={2} />}
          </div>
        ) : (
          <PageHeader
            breadcrumbs={null}
            status=""
            meta={[]}
            actions={[]}
            tabs={null}
            title={<span id={titleId}>{title}</span>}
            description={description ?? null}
          />
        )}
        {cards && cards.length > 0 && (
          <Grid as="ul" cols={{ base: 1, sm: 2 }} gap={4}>
            {cards.map((card, index) => (
              <li key={index} className="min-w-0">
                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <Card className="flex h-full min-w-0 flex-col gap-3 p-4">
                    <CardTitle as="h2">{card.title}</CardTitle>
                    <Text variant="supporting">{card.body}</Text>
                  </Card>
                )}
              </li>
            ))}
          </Grid>
        )}
        <div className="flex min-w-0 flex-col items-start gap-3">
          {loading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <Button nativeButton={false} role="link" render={<a href={primaryAction.href} onClick={primaryAction.onClick} />}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction &&
            (loading ? (
              <Skeleton className="h-9 w-40" />
            ) : (
              <Button
                variant="secondary"
                nativeButton={false}
                role="link"
                render={<a href={secondaryAction.href} onClick={secondaryAction.onClick} />}
              >
                {secondaryAction.label}
              </Button>
            ))}
          {tertiaryLink &&
            (loading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <Link href={tertiaryLink.href} onClick={tertiaryLink.onClick}>
                {tertiaryLink.label}
              </Link>
            ))}
        </div>
        {!loading && footer && (
          <>
            <Separator />
            <Text variant="supporting">{footer}</Text>
          </>
        )}
      </section>
    </AuthLayout>
  );
}
