import { Status404Page } from '@gntik-ai/templates';
import { Logo } from '@gntik-ai/ui';

export function NotFound() {
  return (
    <Status404Page
      header={<Logo size={24} wordmark />}
      title="No route here"
      description="The project, function or page you’re looking for doesn’t exist in this tenant, or was deleted."
      homeHref="/"
      homeLabel="Back to the tenant"
      supportHref="/projects"
      supportLabel="Browse projects"
    />
  );
}
