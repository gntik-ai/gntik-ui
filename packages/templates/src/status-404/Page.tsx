import { ArrowLeft, FileQuestion, Home } from '@gntik-ai/icons';
import { Button, Link, Logo, StatusLayout } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { notFoundContent } from './data';

export interface Status404Props {
  title: ReactNode;
  /** Replaces the built-in title; supply exactly one h1 and use its own ref for route focus. */
  heading?: ReactNode;
  description: ReactNode;
  /** Where the primary action leads. */
  homeHref: string;
  homeLabel: string;
  /** Go back handler; defaults to `history.back()`. */
  onBack: () => void;
  backLabel: string;
  supportHref: string;
  supportLabel: string;
  /** Minimal top bar; defaults to the Logo with wordmark. */
  header: ReactNode;
  fullScreen: boolean;
}

/** 404 page: StatusLayout with a way home, Go back and a support link in the footer. */
export default function Status404Page(props: Partial<Status404Props>) {
  const {
    title = notFoundContent.title,
    heading,
    description = notFoundContent.description,
    homeHref = notFoundContent.homeHref,
    homeLabel = notFoundContent.homeLabel,
    onBack = () => window.history.back(),
    backLabel = notFoundContent.backLabel,
    supportHref = notFoundContent.supportHref,
    supportLabel = notFoundContent.supportLabel,
    header = <Logo size={24} wordmark />,
    fullScreen = true,
  } = props;
  return (
    <StatusLayout
      fullScreen={fullScreen}
      header={header}
      icon={FileQuestion}
      code={notFoundContent.code}
      {...(heading != null ? { heading } : { title })}
      description={description}
      primaryAction={
        <Button icon={Home} render={<a href={homeHref} />} nativeButton={false}>
          {homeLabel}
        </Button>
      }
      secondaryAction={
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
          {backLabel}
        </Button>
      }
      footer={<Link href={supportHref}>{supportLabel}</Link>}
    />
  );
}
