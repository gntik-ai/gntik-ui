import { AuthHeader, ErrorPanel, InlineCallout } from "@gntik-ai/blocks";
import { Lock, SearchX } from "@gntik-ai/icons";
import {
  AuthLayout,
  Button,
  EmptyState,
  Link,
  Skeleton,
  Stack,
} from "@gntik-ai/ui";
import { pendingActivationSample } from "./data";

/** Navigation targets are passed directly to Link; validation belongs to the consumer. */
export type PendingActivationLink = { label: string; href: string };

/** An allowed navigation link or consumer callback. */
export type PendingActivationAction =
  | (PendingActivationLink & { onClick?: never })
  | { label: string; href?: never; onClick: () => void };

export interface PendingActivationPageProps {
  /** The only page-level heading, also retained in recovery states. */
  title?: string;
  /** Description directly below the page heading. */
  intro?: string;
  /** Title announced by the polite status callout, retained in recovery states; match copy to the current state. */
  statusTitle?: string;
  /** Current approval or activation status, supplied by the consumer. */
  statusMessage?: string;
  /** Informational or warning presentation; defaults to info, never assertive. */
  statusTone?: "info" | "warning";
  /** Optional request identifier; absent references render no callout. */
  reference?: { label: string; value: string };
  /** Allowed navigation links or callback buttons, rendered in input order. */
  actions?: readonly PendingActivationAction[];
  /** Accessible name of the actions region, including while loading. */
  actionsLabel?: string;
  /** Loading takes precedence over the supplied actions. */
  loading?: boolean;
  /** Recovery variant; omitted for the normal pending state. */
  errorState?: "no-access" | "not-found" | "error";
  /** Recovery heading below the h1; defaults to the selected state's sample copy. */
  errorTitle?: string;
  /** Consumer explanation of the failure and how to recover. */
  errorMessage?: string;
  /** Retry handler for the error variant; promises show the kit's retry loading state. */
  onRetry?: () => void | Promise<void>;
  /** Text on the error variant's retry button. */
  retryLabel?: string;
  /** Consumer navigation, retained in every state. Required when configuring the page. */
  recoveryLinks: readonly PendingActivationLink[];
  /** Accessible name of the recovery navigation. */
  recoveryLabel?: string;
  /** AuthLayout skip link text. */
  skipLinkLabel?: string;
}

/** Presentational account approval step; render without props for the catalogue preview. */
export default function PendingActivationPage({
  title = pendingActivationSample.title,
  intro = pendingActivationSample.intro,
  statusTitle = pendingActivationSample.statusTitle,
  statusMessage = pendingActivationSample.statusMessage,
  statusTone = "info",
  reference,
  actions = [],
  actionsLabel = "Available actions",
  loading = false,
  errorState,
  errorTitle,
  errorMessage,
  onRetry,
  retryLabel = "Retry",
  recoveryLinks = pendingActivationSample.recoveryLinks,
  recoveryLabel = "Account recovery",
  skipLinkLabel = "Skip to account status",
}: PendingActivationPageProps | Record<string, never> = {}) {
  const recovery = errorState
    ? pendingActivationSample.recovery[errorState]
    : undefined;
  return (
    <AuthLayout fullScreen variant="card" skipLinkLabel={skipLinkLabel}>
      <AuthHeader headingLevel="h1" title={title} description={intro} />
      <Stack gap={4}>
        <InlineCallout
          tone={statusTone}
          title={statusTitle}
          description={statusMessage}
          actions={[]}
          dismissible={false}
        />
        {reference && (
          <InlineCallout
            tone="info"
            title={reference.label}
            description={reference.value}
            actions={[]}
            dismissible={false}
          />
        )}
        {errorState === "error" ? (
          <ErrorPanel
            titleAs="h2"
            title={errorTitle ?? recovery?.title}
            message={errorMessage ?? recovery?.message}
            // @ts-expect-error ErrorPanel hides null codes at runtime, but its prop type excludes null.
            code={null}
            requestId=""
            details=""
            secondaryAction={null}
            onRetry={onRetry}
            retryLabel={retryLabel}
          />
        ) : errorState ? (
          <EmptyState
            titleAs="h2"
            icon={errorState === "no-access" ? Lock : SearchX}
            bordered
            className="mx-auto"
            title={errorTitle ?? recovery?.title}
            description={errorMessage ?? recovery?.message}
          />
        ) : (
          (loading || actions.length > 0) && (
            <section aria-label={actionsLabel} aria-busy={loading}>
              <Stack gap={2}>
                {loading
                  ? Array.from(
                      { length: Math.max(2, actions.length) },
                      (_, index) => (
                        <Skeleton key={index} className="h-10 w-full" />
                      ),
                    )
                  : actions.map((action, index) =>
                      action.href !== undefined ? (
                        <Link key={index} href={action.href}>
                          {action.label}
                        </Link>
                      ) : (
                        <Button
                          key={index}
                          variant="secondary"
                          onClick={action.onClick}
                        >
                          {action.label}
                        </Button>
                      ),
                    )}
              </Stack>
            </section>
          )
        )}
        <nav
          aria-label={recoveryLabel}
          className="flex flex-wrap justify-center gap-4"
        >
          {recoveryLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </Stack>
    </AuthLayout>
  );
}
