import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { NavigationProvider, useActivePage, useNavigation } from './NavigationProvider';
import { useDocumentTitle } from './useDocumentTitle';
import type { NavRoute } from './route-tree';

const routes: NavRoute[] = [
  {
    path: '/functions',
    title: 'Functions',
    group: 'Build',
    hideChildrenInMenu: true,
    children: [{ path: '/functions/:id', title: (p) => p.id ?? '', hideInMenu: true }],
  },
  { path: '/logs', title: 'Logs', group: 'Operate' },
];

function Provider({
  pathname,
  children,
  ...rest
}: {
  pathname: string;
  children?: ReactNode;
  documentTitle?: boolean;
}) {
  return (
    <NavigationProvider routes={routes} pathname={pathname} appTitle="Console" {...rest}>
      {children}
    </NavigationProvider>
  );
}

function EditPage({ title }: { title: string | undefined }) {
  useDocumentTitle(title);
  return null;
}

beforeEach(() => {
  document.title = 'Initial';
});

describe('NavigationProvider document title', () => {
  it('follows the pathname: page title, the separator and the app title', () => {
    const { rerender } = render(<Provider pathname="/functions" />);
    expect(document.title).toBe('Functions · Console');
    rerender(<Provider pathname="/functions/fn-42" />);
    expect(document.title).toBe('fn-42 · Console');
    rerender(<Provider pathname="/unknown" />);
    expect(document.title).toBe('Console');
  });

  it('does not write a newly mounted override once documentTitle turns false', () => {
    const { rerender } = render(<Provider pathname="/functions/fn-42" />);
    expect(document.title).toBe('fn-42 · Console');
    rerender(
      <Provider pathname="/functions/fn-42" documentTitle={false}>
        <EditPage title="Edit fn-42" />
      </Provider>,
    );
    expect(document.title).toBe('fn-42 · Console');
  });

  it('uses a custom separator', () => {
    render(
      <NavigationProvider routes={routes} pathname="/logs" appTitle="Console" titleSeparator=" | ">
        {null}
      </NavigationProvider>,
    );
    expect(document.title).toBe('Logs | Console');
  });

  it('writes only the page title without an appTitle, and nothing for an unknown path', () => {
    const { rerender } = render(
      <NavigationProvider routes={routes} pathname="/logs">
        {null}
      </NavigationProvider>,
    );
    expect(document.title).toBe('Logs');
    rerender(
      <NavigationProvider routes={routes} pathname="/nope">
        {null}
      </NavigationProvider>,
    );
    expect(document.title).toBe('Logs');
  });

  it('never touches the title with documentTitle={false}', () => {
    const { rerender } = render(<Provider pathname="/functions" documentTitle={false} />);
    expect(document.title).toBe('Initial');
    rerender(
      <Provider pathname="/functions" documentTitle={false}>
        <EditPage title="Edit" />
      </Provider>,
    );
    expect(document.title).toBe('Initial');
  });

  it('lets a page override the title and restores the route title on unmount', () => {
    const { rerender } = render(<Provider pathname="/functions/fn-42" />);
    rerender(
      <Provider pathname="/functions/fn-42">
        <EditPage title="Edit fn-42" />
      </Provider>,
    );
    expect(document.title).toBe('Edit fn-42 · Console');
    rerender(<Provider pathname="/functions/fn-42" />);
    expect(document.title).toBe('fn-42 · Console');
  });

  it('applies an override that is mounted together with the provider', () => {
    render(
      <Provider pathname="/functions/fn-42">
        <EditPage title="Edit fn-42" />
      </Provider>,
    );
    expect(document.title).toBe('Edit fn-42 · Console');
  });

  it('restores nested overrides one level at a time, in any unmount order', () => {
    const tree = (outer: boolean, inner: boolean) => (
      <Provider pathname="/logs">
        {outer && <EditPage title="Outer" />}
        {inner && <EditPage title="Inner" />}
      </Provider>
    );
    const { rerender } = render(tree(true, true));
    expect(document.title).toBe('Inner · Console');
    rerender(tree(true, false));
    expect(document.title).toBe('Outer · Console');
    rerender(tree(true, true));
    expect(document.title).toBe('Inner · Console');
    rerender(tree(false, true));
    expect(document.title).toBe('Inner · Console');
    rerender(tree(false, false));
    expect(document.title).toBe('Logs · Console');
  });

  it('lets a nested child win over its parent when both mount together', () => {
    function Parent({ children }: { children?: ReactNode }) {
      useDocumentTitle('Outer');
      return <>{children}</>;
    }
    const { rerender } = render(
      <Provider pathname="/logs">
        <Parent>
          <EditPage title="Inner" />
        </Parent>
      </Provider>,
    );
    expect(document.title).toBe('Inner · Console');
    rerender(
      <Provider pathname="/logs">
        <Parent />
      </Provider>,
    );
    expect(document.title).toBe('Outer · Console');
  });

  it('follows an override whose text changes and ignores an undefined one', () => {
    const { rerender } = render(
      <Provider pathname="/logs">
        <EditPage title="One" />
      </Provider>,
    );
    rerender(
      <Provider pathname="/logs">
        <EditPage title="Two" />
      </Provider>,
    );
    expect(document.title).toBe('Two · Console');
    rerender(
      <Provider pathname="/logs">
        <EditPage title={undefined} />
      </Provider>,
    );
    expect(document.title).toBe('Logs · Console');
  });
});

describe('useDocumentTitle without a provider', () => {
  it('sets the title while mounted and restores the previous one', () => {
    const { unmount } = render(<EditPage title="Standalone" />);
    expect(document.title).toBe('Standalone');
    unmount();
    expect(document.title).toBe('Initial');
  });
});

describe('navigation hooks', () => {
  function Probe() {
    const navigation = useNavigation();
    const page = useActivePage();
    return (
      <p>
        {navigation?.pathname}|{navigation?.groups.map((g) => g.label).join(',')}|{page?.title ?? 'none'}|
        {navigation?.routes.length}
      </p>
    );
  }

  it('exposes routes, groups, pathname and the active page', () => {
    render(
      <Provider pathname="/functions/fn-42?tab=logs">
        <Probe />
      </Provider>,
    );
    expect(screen.getByText('/functions/fn-42?tab=logs|Build,Operate|fn-42|2')).toBeInTheDocument();
  });

  it('returns null outside a provider so callers can detect it', () => {
    render(<Probe />);
    expect(screen.getByText('||none|')).toBeInTheDocument();
  });

  it('returns null from useActivePage on an unknown path', () => {
    render(
      <Provider pathname="/nope">
        <Probe />
      </Provider>,
    );
    expect(screen.getByText('/nope|Build,Operate|none|2')).toBeInTheDocument();
  });
});
