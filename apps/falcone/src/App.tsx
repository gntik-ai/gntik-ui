import { useEffect, type ReactNode } from 'react';
import { workflows } from './data/workflows';
import { Audit } from './pages/audit';
import { SignIn } from './pages/auth';
import { FunctionsIndex } from './pages/functions';
import { Home } from './pages/home';
import { NotFound } from './pages/not-found';
import { ProjectDetail, ProjectsIndex } from './pages/projects';
import { Settings } from './pages/settings';
import { Usage } from './pages/usage';
import { WorkflowBuilder } from './pages/workflows';
import { matchPath, navigate, usePath } from './router';

type Params = Record<string, string>;

/** Replaces the current entry (redirect routes). */
function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

/** The route table, first match wins. */
const ROUTES: Array<[pattern: string, render: (p: Params) => ReactNode]> = [
  ['/sign-in', () => <SignIn />],
  ['/', () => <Home />],
  ['/projects', () => <ProjectsIndex />],
  ['/projects/:id', (p) => <ProjectDetail id={p.id ?? ''} />],
  ['/functions', () => <FunctionsIndex />],
  ['/workflows', () => <Redirect to={`/workflows/${workflows[0]?.id ?? ''}`} />],
  ['/workflows/:id', (p) => <WorkflowBuilder id={p.id ?? ''} />],
  ['/usage', () => <Usage />],
  ['/audit', () => <Audit />],
  ['/settings', () => <Redirect to="/settings/profile" />],
  ['/settings/:page', (p) => <Settings page={p.page ?? ''} />],
];

export function App() {
  const path = usePath();
  for (const [pattern, render] of ROUTES) {
    const params = matchPath(pattern, path);
    if (params) return <>{render(params)}</>;
  }
  return <NotFound />;
}
