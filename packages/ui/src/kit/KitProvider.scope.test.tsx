import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { KitProvider } from './KitProvider';
import { Dialog, DialogContent, DialogTitle } from '../components/Dialog';
import { ThemeScope } from '../theme/ThemeScope';
import { useTheme } from '../theme/ThemeProvider';
import { gntikPreset } from '../theme/presets';

function OpenDialog() {
  return (
    <Dialog open modal={false}>
      <DialogContent>
        <DialogTitle>Scoped dialog</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}

it('keeps nested theme mounts, updates and unmounts from changing the outer document theme', () => {
  function Panel() {
    const { resolved, setMode } = useTheme();
    return <button onClick={() => setMode('high_contrast')}>Panel: {resolved}</button>;
  }
  function App() {
    const [visible, setVisible] = useState(false);
    return (
      <KitProvider theme={{ forcedMode: 'dark', palette: 'green', storageKey: null }}>
        <button onClick={() => setVisible(!visible)}>Toggle panel</button>
        {visible && (
          <KitProvider theme={{ defaultMode: 'light', brand: { ...gntikPreset, id: 'panel' }, palette: 'navy' }}>
            <Panel />
          </KitProvider>
        )}
      </KitProvider>
    );
  }
  render(<App />);
  const html = document.documentElement;
  const before = html.outerHTML.split('>')[0];
  fireEvent.click(screen.getByRole('button', { name: 'Toggle panel' }));
  expect(html.outerHTML.split('>')[0]).toBe(before);
  fireEvent.click(screen.getByRole('button', { name: 'Panel: light' }));
  expect(screen.getByRole('button', { name: 'Panel: high_contrast' })).toBeVisible();
  expect(html.outerHTML.split('>')[0]).toBe(before);
  const wrapper = screen.getByRole('button', { name: 'Panel: high_contrast' }).closest('[data-kit-scope]');
  expect(wrapper).toHaveClass('high_contrast');
  expect(wrapper).toHaveAttribute('data-brand', 'panel');
  expect(wrapper).toHaveAttribute('data-palette', 'navy');
  fireEvent.click(screen.getByRole('button', { name: 'Toggle panel' }));
  expect(screen.queryByRole('button', { name: /Panel:/ })).toBeNull();
  expect(html.outerHTML.split('>')[0]).toBe(before);
});

it('scopes all theme, locale, density and portal writes to its own wrapper', async () => {
  const html = document.documentElement;
  const before = html.outerHTML.split('>')[0];
  const { container, unmount } = render(
    <KitProvider
      scoped
      theme={{ defaultMode: 'high_contrast', defaultMotion: 'reduce', palette: 'navy' }}
      i18n={{ locale: 'es', dir: 'rtl', applyTo: 'document' }}
      density={{ density: 'compact', applyTo: 'document' }}
    >
      <OpenDialog />
    </KitProvider>,
  );
  const wrapper = container.querySelector('[data-kit-scope]');
  expect(wrapper).toHaveClass('high_contrast');
  expect(wrapper).toHaveStyle({ colorScheme: 'dark' });
  expect(wrapper).toHaveAttribute('data-motion', 'reduce');
  expect(wrapper).toHaveAttribute('data-palette', 'navy');
  expect(wrapper).toHaveAttribute('lang', 'es');
  expect(wrapper).toHaveAttribute('dir', 'rtl');
  expect(wrapper).toHaveAttribute('data-density', 'compact');
  expect(wrapper).toContainElement(await screen.findByRole('dialog'));
  expect(html.outerHTML.split('>')[0]).toBe(before);
  unmount();
  expect(html.outerHTML.split('>')[0]).toBe(before);
});

it.each([undefined, { forcedMode: 'high_contrast' as const }])(
  'inherits a ThemeScope portal when a nested KitProvider has no portal settings (theme: %j)',
  async (theme) => {
    render(
      <KitProvider>
        <ThemeScope theme="light">
          <KitProvider density="compact" theme={theme}>
            <OpenDialog />
          </KitProvider>
        </ThemeScope>
      </KitProvider>,
    );
    expect((await screen.findByRole('dialog')).closest('[data-theme-scope-portal]')).toHaveClass('light');
  },
);

it('server renders without document or window and keeps the initial theme', () => {
  vi.stubGlobal('document', undefined);
  vi.stubGlobal('window', undefined);
  try {
    expect(
      renderToString(
        <KitProvider theme={{ initialMode: 'light' }}>
          <span>Server</span>
        </KitProvider>,
      ),
    ).toContain('Server');
    expect(
      renderToString(
        <KitProvider scoped theme={{ initialMode: 'dark' }}>
          <span>Scoped server</span>
        </KitProvider>,
      ),
    ).toContain('Scoped server');
  } finally {
    vi.unstubAllGlobals();
  }
});

it('keeps scoped density wrapper classes and ref on the same themed element', () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <KitProvider scoped density={{ density: 'compact', className: 'rounded-lg', ref }}>
      <span>Panel</span>
    </KitProvider>,
  );
  const wrapper = container.querySelector('[data-kit-scope]');
  expect(wrapper).toHaveClass('rounded-lg', 'dark');
  expect(ref.current).toBe(wrapper);
});

it('gives a scoped light panel an explicit light class to reset an ancestor dark theme', () => {
  const { container } = render(
    <KitProvider>
      <KitProvider scoped theme={{ forcedMode: 'light' }} toast={false}>
        <span>Light panel</span>
      </KitProvider>
    </KitProvider>,
  );
  expect(document.documentElement).toHaveClass('dark');
  expect(container.querySelector('[data-kit-scope]')).toHaveClass('light');
});
