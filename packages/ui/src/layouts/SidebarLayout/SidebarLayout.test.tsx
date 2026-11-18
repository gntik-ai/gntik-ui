import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { I18nProvider } from '../../i18n/I18nProvider';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { SidebarLayout } from './SidebarLayout';
import SidebarLayoutApp from './examples/SidebarLayoutApp';
import SidebarLayoutOffcanvas from './examples/SidebarLayoutOffcanvas';

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {}
});

describe('SidebarLayout', () => {
  it('renders the landmarks: sidebar, banner, main', () => {
    render(<SidebarLayoutApp />);
    expect(screen.getByRole('complementary', { name: 'Sidebar' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'sidebar-layout-main');
  });

  it('the skip link is the first Tab stop and moves focus to main', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('Enter / Space on the collapse toggle switch the icon rail and persist it', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    toggle.focus();
    await user.keyboard('{Enter}');
    const expand = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('complementary')).toHaveAttribute('data-state', 'rail');
    expect(localStorage.getItem('example-sidebar-collapsed')).toBe('true');
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('restores the persisted collapsed state', () => {
    localStorage.setItem('example-sidebar-collapsed', 'true');
    render(<SidebarLayoutApp />);
    expect(screen.getByRole('complementary')).toHaveAttribute('data-state', 'rail');
  });

  it('off-canvas mode hides the sidebar (inert) when collapsed', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutOffcanvas />);
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('complementary', { hidden: true })).toHaveAttribute('data-state', 'offcanvas');
  });

  it('the menu button opens the drawer; Escape closes it and returns focus', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    const menu = screen.getByRole('button', { name: 'Open navigation' });
    menu.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Sidebar' });
    expect(within(dialog).getByRole('navigation', { name: 'Workspace' })).toBeInTheDocument();
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(menu).toHaveFocus();
  });

  it('navigating inside the drawer closes it', async () => {
    const user = userEvent.setup();
    render(<SidebarLayoutApp />);
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sidebar' });
    await user.click(within(dialog).getByRole('link', { name: 'Billing' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { level: 1, name: 'Billing' })).toBeInTheDocument();
  });

  it('fullScreen uses the viewport height', () => {
    const { container } = render(<SidebarLayout fullScreen sidebar={null} />);
    expect(container.firstElementChild).toHaveClass('h-dvh');
  });

  it('examples have no axe violations (closed and with the drawer open)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SidebarLayoutOffcanvas />);
    await expectNoAxeViolations();
    unmount();
    render(<SidebarLayoutApp />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});

describe('SidebarLayout scrollable main', () => {
  let notifyResize: () => void;
  let contentHeight: number;

  beforeEach(() => {
    contentHeight = 300;
    notifyResize = () => {};
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.tagName === 'MAIN' ? contentHeight : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.tagName === 'MAIN' ? 100 : 0;
    });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          notifyResize = () => callback([], this as unknown as ResizeObserver);
        }
        observe() {
          notifyResize();
        }
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('makes an overflowing main named and reachable with Tab, then removes the stop when it fits', async () => {
    const user = userEvent.setup();
    render(
      <SidebarLayout sidebar={null} collapsible={false}>
        <p>Static content</p>
      </SidebarLayout>,
    );
    const main = screen.getByRole('main');
    await waitFor(() => expect(main).toHaveAttribute('tabindex', '0'));
    expect(main).toHaveAccessibleName('Main content');
    screen.getByRole('button', { name: 'Open navigation' }).focus();
    await user.tab();
    expect(main).toHaveFocus();
    contentHeight = 101;
    act(() => notifyResize());
    await waitFor(() => expect(main).toHaveAttribute('tabindex', '-1'));
    expect(main).not.toHaveAttribute('aria-label');
  });

  it.each([
    ['en', undefined, 'Main content'],
    ['es', undefined, 'Contenido principal'],
    ['en', 'Reading area', 'Reading area'],
    ['es', 'Reading area', 'Reading area'],
  ])('uses the catalog name or an explicit mainLabel (%s, %s)', async (locale, label, expected) => {
    render(
      <I18nProvider locale={locale}>
        <SidebarLayout sidebar={null} mainLabel={label}>
          <p>Content</p>
        </SidebarLayout>
      </I18nProvider>,
    );
    await waitFor(() => expect(screen.getByRole('main')).toHaveAccessibleName(expected));
  });

  it('keeps a fitting main out of the Tab order while the skip link still focuses it', async () => {
    contentHeight = 100;
    const user = userEvent.setup();
    render(
      <SidebarLayout sidebar={null} collapsible={false}>
        <p>Content</p>
      </SidebarLayout>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(main).not.toHaveAttribute('aria-label');
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(main).toHaveFocus();
    screen.getByRole('button', { name: 'Open navigation' }).focus();
    await user.tab();
    expect(main).not.toHaveFocus();
  });

  it('remeasures content replacement even when the main size stays the same', async () => {
    const { rerender } = render(
      <SidebarLayout sidebar={null}>
        <p>Long content</p>
      </SidebarLayout>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('tabindex', '0');
    contentHeight = 100;
    rerender(
      <SidebarLayout sidebar={null}>
        <section>Short content</section>
      </SidebarLayout>,
    );
    await waitFor(() => expect(main).toHaveAttribute('tabindex', '-1'));
    contentHeight = 300;
    rerender(<SidebarLayout sidebar={null}>Long text without a wrapper</SidebarLayout>);
    await waitFor(() => expect(main).toHaveAttribute('tabindex', '0'));
  });

  it('renders the server markup without a tab stop or label', () => {
    const markup = renderToString(<SidebarLayout sidebar={null}>Content</SidebarLayout>);
    const container = document.createElement('div');
    container.innerHTML = markup;
    expect(container.querySelector('main')).toHaveAttribute('tabindex', '-1');
    expect(container.querySelector('main')).not.toHaveAttribute('aria-label');
  });

  it('renders safely without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    render(<SidebarLayout sidebar={null}>Content</SidebarLayout>);
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it.each(['dark', 'light', 'high_contrast'] as const)(
    'has no axe violations with overflowing static content (%s)',
    async (mode) => {
      render(
        <ThemeProvider defaultMode={mode} storageKey={null}>
          <SidebarLayout sidebar={null}>
            <p>Static content</p>
          </SidebarLayout>
        </ThemeProvider>,
      );
      await waitFor(() => expect(screen.getByRole('main')).toHaveAttribute('tabindex', '0'));
      await expectNoAxeViolations();
    },
  );
});
