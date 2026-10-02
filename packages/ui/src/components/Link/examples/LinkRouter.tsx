import type { ComponentPropsWithRef } from 'react';
import { Link, LinkProvider } from '../Link';

/**
 * Stand-in for a router's Link (Next.js, React Router, TanStack…). A real adapter maps `href`
 * to the router's prop (e.g. `to`) and navigates on the client.
 */
function RouterLink(props: ComponentPropsWithRef<'a'>) {
  return <a data-router-link="" {...props} />;
}

export default function LinkRouter() {
  return (
    <LinkProvider component={RouterLink}>
      <nav aria-label="Project" className="flex gap-4 text-[13px]">
        <Link href="/projects">Projects</Link>
        <Link href="/projects/new">New project</Link>
        <Link href="https://status.example.com" external>Status page</Link>
      </nav>
    </LinkProvider>
  );
}
