import { NavigationProvider, type NavRoute } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import { createHash } from 'node:crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConsoleShell } from './ConsoleShell';

const routes: NavRoute[] = [
  {
    path: '/functions',
    title: 'Functions',
    group: 'Build',
    hideChildrenInMenu: true,
    children: [{ path: '/functions/:id', title: (p) => p.id ?? '' }],
  },
  { path: '/logs', title: 'Logs', group: 'Operate' },
];

const inProvider = (pathname: string, shell: React.ReactNode) => (
  <NavigationProvider routes={routes} pathname={pathname} home={{ label: 'Home', href: '/' }}>
    {shell}
  </NavigationProvider>
);

describe('ConsoleShell inside a NavigationProvider', () => {
  it('derives the sidebar, the current item and the trail from the route tree', () => {
    render(inProvider('/functions/fn-42', <ConsoleShell>Content</ConsoleShell>));
    const sidebar = screen.getByRole('navigation', { name: 'Main' });
    expect(within(sidebar).getByRole('link', { name: 'Functions' })).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).queryByRole('link', { name: 'Logs' })).not.toHaveAttribute('aria-current');
    expect(within(sidebar).getByText('Build')).toBeInTheDocument();
    expect(within(sidebar).queryByText('Workspace')).toBeNull();
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(trail).getByRole('link', { name: 'Functions' })).toHaveAttribute('href', '/functions');
    expect(within(trail).getByText('fn-42')).toHaveAttribute('aria-current', 'page');
  });

  it('lets explicit nav, currentHref and breadcrumbs win', () => {
    render(
      inProvider(
        '/functions/fn-42',
        <ConsoleShell
          nav={[
            {
              label: 'Mine',
              items: [
                { label: 'Alpha', href: '/alpha' },
                { label: 'Beta', href: '/beta' },
              ],
            },
          ]}
          currentHref="/beta"
          breadcrumbs={[{ label: 'Explicit' }]}
        >
          Content
        </ConsoleShell>,
      ),
    );
    const sidebar = screen.getByRole('navigation', { name: 'Main' });
    expect(within(sidebar).getByRole('link', { name: 'Beta' })).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).queryByRole('link', { name: 'Functions' })).toBeNull();
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(trail).getByText('Explicit')).toBeInTheDocument();
    expect(within(trail).queryByText('fn-42')).toBeNull();
  });

  it('hides the trail for breadcrumbs={null}, and for an unknown path', () => {
    const { unmount } = render(inProvider('/functions/fn-42', <ConsoleShell breadcrumbs={null}>Content</ConsoleShell>));
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
    unmount();
    render(inProvider('/nowhere', <ConsoleShell>Content</ConsoleShell>));
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
    const sidebar = screen.getByRole('navigation', { name: 'Main' });
    expect(within(sidebar).queryByRole('link', { current: 'page' })).toBeNull();
  });
});

describe('ConsoleShell outside a NavigationProvider', () => {
  it('renders the same DOM as before the provider existed', () => {
    const html = renderToStaticMarkup(<ConsoleShell>Content</ConsoleShell>);
    expect(createHash('sha256').update(html).digest('hex')).toBe(
      '841b9bccf1601461bbf56ed0ebed6719a765250344c9a01c6703fc1e7735f6a5',
    );
  });
});
