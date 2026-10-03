import { useEffect, type ReactNode } from 'react';
import { workflows } from './data/workflows';
import { AgentDetail, AgentNew, AgentsIndex } from './pages/agents';
import { Assistant } from './pages/assistant';
import { Mfa, SignIn } from './pages/auth';
import { Evaluations } from './pages/evaluations';
import { Fleet } from './pages/fleet';
import { Home } from './pages/home';
import { NotFound } from './pages/not-found';
import { RunTrace, RunsIndex } from './pages/runs';
import { Settings } from './pages/settings';
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
  ['/mfa', () => <Mfa />],
  ['/', () => <Home />],
  ['/agents', () => <AgentsIndex />],
  ['/agents/new', () => <AgentNew />],
  ['/agents/:id', (p) => <AgentDetail id={p.id ?? ''} />],
  ['/fleet', () => <Fleet />],
  ['/runs', () => <RunsIndex />],
  ['/runs/:id', (p) => <RunTrace id={p.id ?? ''} />],
  ['/workflows', () => <Redirect to={`/workflows/${workflows[0]?.id ?? ''}`} />],
  ['/workflows/:id', (p) => <WorkflowBuilder id={p.id ?? ''} />],
  ['/assistant', () => <Assistant />],
  ['/evaluations', () => <Evaluations />],
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
