import { Providers as NextProviders } from '../../../../apps/example-next/app/providers';
import { useTheme as usePublishedTheme } from '@gntik-ai/ui';
import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { KitProvider } from './KitProvider';
import { useTheme, type ThemeMode } from '../theme/ThemeProvider';

function Mode() {
  return <span>{useTheme().mode}</span>;
}

it.each<ThemeMode>(['dark', 'light', 'high_contrast'])(
  'hydrates a cookie-provided initialMode of %s without warnings',
  async (initialMode) => {
    const app = (
      <KitProvider theme={{ initialMode, storageKey: null }}>
        <Mode />
      </KitProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(app);
    document.body.appendChild(container);
    const errors: unknown[] = [];
    const consoleErrors = vi.spyOn(console, 'error').mockImplementation((error: unknown) => errors.push(error));
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, app, { onRecoverableError: (error) => errors.push(error) });
      });
      expect(container.querySelector('span')).toHaveTextContent(initialMode);
      expect(errors).toEqual([]);
    } finally {
      await act(async () => root?.unmount());
      consoleErrors.mockRestore();
      container.remove();
    }
  },
);

it('the Next example hydrates its cookie theme through the real app provider', async () => {
  function AppMode() {
    return <span>{usePublishedTheme().mode}</span>;
  }
  const app = (
    <NextProviders initialMode="high_contrast">
      <AppMode />
    </NextProviders>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(app);
  document.body.appendChild(container);
  const errors: unknown[] = [];
  const consoleErrors = vi.spyOn(console, 'error').mockImplementation((error: unknown) => errors.push(error));
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, app, { onRecoverableError: (error) => errors.push(error) });
    });
    expect(container.querySelector('span')).toHaveTextContent('high_contrast');
    expect(document.cookie).toContain('high_contrast');
    expect(errors).toEqual([]);
  } finally {
    await act(async () => root?.unmount());
    consoleErrors.mockRestore();
    container.remove();
  }
});
