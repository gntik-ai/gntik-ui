import { Check, Home, Lock } from '@gntik-ai/icons';
import { Button, Link, Logo, StatusLayout } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { forbiddenContent } from './data';

export interface Status403Props {
  /** What the viewer cannot see. */
  resource: string;
  /** Who can grant access. */
  owner: string;
  /** Called on "Request access"; may return a promise (the button shows a spinner). */
  onRequestAccess: () => void | Promise<void>;
  /** Start in the "requested" state (a pending request exists). */
  defaultRequested: boolean;
  homeHref: string;
  homeLabel: string;
  /** Account shown in the footer; `null` hides the line. */
  signedInAs: string | null;
  switchAccountHref: string;
  header: ReactNode;
  fullScreen: boolean;
}

type RequestState = 'idle' | 'pending' | 'requested';

/** 403 page: StatusLayout with Request access (NoAccessEmpty behaviour) and a way home. */
export default function Status403Page(props: Partial<Status403Props>) {
  const {
    resource = forbiddenContent.resource,
    owner = forbiddenContent.owner,
    onRequestAccess,
    defaultRequested = false,
    homeHref = forbiddenContent.homeHref,
    homeLabel = forbiddenContent.homeLabel,
    signedInAs = forbiddenContent.signedInAs,
    switchAccountHref = forbiddenContent.switchAccountHref,
    header = <Logo size={24} wordmark />,
    fullScreen = true,
  } = props;
  const [state, setState] = useState<RequestState>(defaultRequested ? 'requested' : 'idle');

  const request = async () => {
    setState('pending');
    try {
      await onRequestAccess?.();
      setState('requested');
    } catch {
      setState('idle');
    }
  };

  const requested = state === 'requested';
  return (
    <StatusLayout
      fullScreen={fullScreen}
      tone="warning"
      header={header}
      icon={Lock}
      code={forbiddenContent.code}
      title={`You don’t have access to ${resource}`}
      description={`Ask ${owner} to grant you a role that includes ${resource.toLowerCase()} permissions.`}
      primaryAction={
        <Button
          variant={requested ? 'secondary' : 'primary'}
          icon={requested ? Check : undefined}
          loading={state === 'pending'}
          disabled={requested}
          onClick={() => void request()}
        >
          {requested ? 'Access requested' : 'Request access'}
        </Button>
      }
      secondaryAction={
        <Button variant="secondary" icon={Home} render={<a href={homeHref} />} nativeButton={false}>
          {homeLabel}
        </Button>
      }
      footer={
        signedInAs ? (
          <span>
            Signed in as <span className="font-mono">{signedInAs}</span> · <Link href={switchAccountHref}>{forbiddenContent.switchAccountLabel}</Link>
          </span>
        ) : undefined
      }
    >
      <p role="status" className="sr-only">
        {requested ? 'Access request sent' : ''}
      </p>
    </StatusLayout>
  );
}
