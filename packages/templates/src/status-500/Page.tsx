import { ErrorPanel, type FeedbackAction } from '@gntik-ai/blocks';
import { ServerCrash } from '@gntik-ai/icons';
import { Link, Logo, StatusLayout } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { serverErrorContent, simulateRetry } from './data';

export interface Status500Props {
  title: ReactNode;
  description: ReactNode;
  /** Status or error code on the ErrorPanel chip. */
  errorCode: string | number;
  /** Correlation id for support (copyable). */
  requestId: string;
  /** Raw details behind the disclosure. */
  details: string;
  /** Retry handler; a returned promise shows the loading state. */
  onRetry: () => void | Promise<void>;
  /** Extra action next to Retry; `null` hides it. */
  supportAction: FeedbackAction | null;
  homeHref: string;
  statusHref: string;
  header: ReactNode;
  fullScreen: boolean;
}

/** 500 page: StatusLayout + ErrorPanel with request id, retry and technical details. */
export default function Status500Page(props: Partial<Status500Props>) {
  const {
    title = serverErrorContent.title,
    description = serverErrorContent.description,
    errorCode = serverErrorContent.errorCode,
    requestId = serverErrorContent.requestId,
    details = serverErrorContent.details,
    onRetry = simulateRetry,
    supportAction = { label: 'Contact support', variant: 'ghost' },
    homeHref = serverErrorContent.homeHref,
    statusHref = serverErrorContent.statusHref,
    header = <Logo size={24} wordmark />,
    fullScreen = true,
  } = props;
  return (
    <StatusLayout
      fullScreen={fullScreen}
      tone="destructive"
      header={header}
      icon={ServerCrash}
      code={serverErrorContent.code}
      title={title}
      description={description}
      footer={
        <>
          <Link href={homeHref}>{serverErrorContent.homeLabel}</Link>
          <Link href={statusHref}>{serverErrorContent.statusLabel}</Link>
        </>
      }
    >
      <ErrorPanel
        titleAs="h2"
        className="text-start"
        title={serverErrorContent.panelTitle}
        message={serverErrorContent.panelMessage}
        code={errorCode}
        requestId={requestId}
        details={details}
        onRetry={onRetry}
        secondaryAction={supportAction}
      />
    </StatusLayout>
  );
}
