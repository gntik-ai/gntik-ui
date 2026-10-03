import { Status403Page, Status404Page, Status500Page, StatusMaintenancePage } from '@gntik-ai/templates';
import { forbidden, maintenance, serverError, supportHref } from '../data/status';

export function Forbidden() {
  return <Status403Page {...forbidden} homeHref="/" switchAccountHref="/sign-in" />;
}

export function NotFound() {
  return <Status404Page homeHref="/" supportHref={supportHref} />;
}

export function ServerError() {
  return <Status500Page {...serverError} homeHref="/" statusHref="/status/maintenance" supportAction={{ label: 'Contact support', variant: 'ghost', href: supportHref }} />;
}

export function Maintenance() {
  return (
    <StatusMaintenancePage
      {...maintenance}
      statusHref="/status/maintenance"
      subscribeHref={supportHref}
      onCheckAgain={async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return false;
      }}
    />
  );
}
