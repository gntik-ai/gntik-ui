import { LinkProvider } from '@gntik-ai/ui';
import { Fragment, useEffect, type ReactNode } from 'react';
import { ForgotPassword, SignIn, SignUp } from './pages/auth';
import { Home, Inbox, NewProject, Onboarding, ProjectDetail, Projects, Search } from './pages/console';
import { Settings } from './pages/settings';
import { Forbidden, Maintenance, NotFound, ServerError } from './pages/status';
import { matchPath, navigate, RouterLink, usePath } from './router';

/** Redirects on mount (e.g. /settings → /settings/profile). */
function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

type Route = [pattern: string, render: (params: Record<string, string>) => ReactNode];

/** The route table: every page is a kit template fed with the app's data (src/data). */
const routes: Route[] = [
  ['/sign-in', () => <SignIn />],
  ['/sign-up', () => <SignUp />],
  ['/forgot-password', () => <ForgotPassword />],
  ['/onboarding', () => <Onboarding />],
  ['/', () => <Home />],
  ['/projects', () => <Projects />],
  ['/projects/new', () => <NewProject />],
  ['/projects/:id', ({ id = '' }) => <ProjectDetail id={id} />],
  ['/inbox', () => <Inbox />],
  ['/search', () => <Search />],
  ['/settings', () => <Redirect to="/settings/profile" />],
  ['/settings/:page', ({ page = '' }) => <Settings page={page} />],
  ['/status/403', () => <Forbidden />],
  ['/status/404', () => <NotFound />],
  ['/status/500', () => <ServerError />],
  ['/status/maintenance', () => <Maintenance />],
];

export default function App() {
  const path = usePath();
  let page: ReactNode = <NotFound />;
  for (const [pattern, render] of routes) {
    const params = matchPath(pattern, path);
    if (params) {
      page = render(params);
      break;
    }
  }
  // Keyed by path: templates keep local state (forms, tabs), so each route starts fresh.
  return (
    <LinkProvider component={RouterLink}>
      <Fragment key={path}>{page}</Fragment>
    </LinkProvider>
  );
}
