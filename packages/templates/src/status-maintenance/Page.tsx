import { SystemBanner } from '@gntik-ai/blocks';
import { ExternalLink, RefreshCw, Wrench } from '@gntik-ai/icons';
import { Button, Logo, StatusLayout } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { maintenanceContent } from './data';

export interface StatusMaintenanceProps {
  title: ReactNode;
  description: ReactNode;
  /** Bold lead-in and message of the maintenance banner. */
  bannerTitle: ReactNode;
  bannerMessage: ReactNode;
  statusHref: string;
  subscribeHref: string;
  /**
   * "Check again" handler. Resolve `true` when the service is back (the product then navigates);
   * anything else shows the "still in maintenance" note.
   */
  onCheckAgain: () => boolean | void | Promise<boolean | void>;
  header: ReactNode;
  fullScreen: boolean;
}

/** Maintenance page: StatusLayout with Check again, a status page link and a maintenance SystemBanner. */
export default function StatusMaintenancePage(props: Partial<StatusMaintenanceProps>) {
  const {
    title = maintenanceContent.title,
    description = maintenanceContent.description,
    bannerTitle = maintenanceContent.bannerTitle,
    bannerMessage = maintenanceContent.bannerMessage,
    statusHref = maintenanceContent.statusHref,
    subscribeHref = maintenanceContent.subscribeHref,
    onCheckAgain,
    header = <Logo size={24} wordmark />,
    fullScreen = true,
  } = props;
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState('');

  const check = async () => {
    setChecking(true);
    setNote('');
    try {
      const back = await onCheckAgain?.();
      if (back !== true) setNote(maintenanceContent.stillDown);
    } finally {
      setChecking(false);
    }
  };

  return (
    <StatusLayout
      fullScreen={fullScreen}
      tone="warning"
      header={header}
      icon={Wrench}
      code={maintenanceContent.code}
      title={title}
      description={description}
      primaryAction={
        <Button icon={RefreshCw} loading={checking} onClick={() => void check()}>
          Check again
        </Button>
      }
      secondaryAction={
        <Button variant="secondary" trailingIcon={ExternalLink} render={<a href={statusHref} />} nativeButton={false}>
          {maintenanceContent.statusLabel}
        </Button>
      }
    >
      <SystemBanner
        kind="maintenance"
        dismissible={false}
        title={bannerTitle}
        message={bannerMessage}
        action={{ label: maintenanceContent.subscribeLabel, href: subscribeHref }}
        className="rounded-lg border text-start"
      />
      <p aria-live="polite" className="mt-3 min-h-4 text-[12.5px] text-muted-foreground">
        {note}
      </p>
    </StatusLayout>
  );
}
