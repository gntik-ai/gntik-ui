import { Status404Page } from '@gntik-ai/templates';
import { Logo } from '@gntik-ai/ui';

export function NotFound() {
  return (
    <Status404Page
      header={<Logo size={24} wordmark />}
      title="This page isn’t part of the fleet"
      description="The agent, run or page you’re looking for doesn’t exist or was deleted."
      homeHref="/"
      homeLabel="Back to the fleet"
      supportHref="/assistant"
      supportLabel="Ask the assistant"
    />
  );
}
