import { Link, Button } from '@gntik-ai/ui';
import { Link as RouterLink } from 'react-router';

export function Nav() {
  return (
    <nav>
      <Link href="/projects">Projects</Link>
      <Link href="/billing" underline="hover">
        Billing
      </Link>
      <RouterLink to="/x">Router</RouterLink>
      <Button>Go</Button>
    </nav>
  );
}
