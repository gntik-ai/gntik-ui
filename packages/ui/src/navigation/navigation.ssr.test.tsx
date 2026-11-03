// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { NavigationProvider, useActivePage } from './NavigationProvider';
import { getActivePage, navFromRoutes, type NavRoute } from './route-tree';
import { useDocumentTitle } from './useDocumentTitle';

const routes: NavRoute[] = [
  {
    path: '/functions',
    title: 'Functions',
    group: 'Build',
    children: [{ path: '/functions/:id', title: (p) => p.id ?? '' }],
  },
];

function Page() {
  useDocumentTitle('Edit');
  return <p>{useActivePage()?.title}</p>;
}

describe('navigation on the server', () => {
  it('runs the helpers without a DOM', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(navFromRoutes(routes)[0]?.label).toBe('Build');
    expect(getActivePage(routes, '/functions/fn-42')?.title).toBe('fn-42');
  });

  it('renders the provider with renderToString without reading or writing document.title', () => {
    const html = renderToString(
      <NavigationProvider routes={routes} pathname="/functions/fn-42" appTitle="Console">
        <Page />
      </NavigationProvider>,
    );
    expect(html).toBe('<p>fn-42</p>');
  });
});
