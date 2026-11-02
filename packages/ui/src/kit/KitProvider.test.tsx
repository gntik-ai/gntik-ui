import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/Tooltip';
import { fireEvent, render, screen } from '@testing-library/react';
import { useI18n } from '../i18n/I18nProvider';
import { useDensity } from '../density/density-context';
import { useCSP } from '../csp/CSPProvider';
import { Link } from '../components/Link';
import { ToastProvider, Toaster, useToast } from '../components/Toast';
import { LiveAnnouncer, useAnnounce } from '../components/LiveAnnouncer';
import { useTheme } from '../theme/ThemeProvider';
import { useState } from 'react';
import { KitProvider, useApp } from './KitProvider';

function Actions() {
  const toast = useToast();
  const announce = useAnnounce();
  const { resolved, brand } = useTheme();
  return (
    <button
      onClick={() => {
        toast.add({ title: 'Saved' });
        announce('Moved');
      }}
    >
      {resolved}/{brand.id}
    </button>
  );
}

it('provides dark gntik defaults, a working toast stack and a single announcer without wrapping children', async () => {
  const { container } = render(
    <KitProvider>
      <Actions />
    </KitProvider>,
  );
  expect(container.firstElementChild?.tagName).toBe('BUTTON');
  expect(screen.getByRole('button', { name: 'dark/gntik' })).toBeVisible();
  expect(document.documentElement).toHaveClass('dark');
  fireEvent.click(screen.getByRole('button', { name: 'dark/gntik' }));
  expect(await screen.findByText('Saved')).toBeVisible();
  expect(screen.getAllByRole('region', { name: 'Notifications' })).toHaveLength(1);
  expect(document.querySelectorAll('[data-live-announcer]')).toHaveLength(2);
  expect(document.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('Moved');
});

function Settings() {
  const { t } = useI18n();
  const density = useDensity();
  const { setMode, setMotion, setPalette } = useTheme();
  const csp = useCSP();
  return (
    <>
      <output>
        {t('common.cancel')}:{density}:{csp.nonce}
      </output>
      <Link href="/a">Route</Link>
      <button
        onClick={() => {
          setMode('light');
          setMotion('reduce');
          setPalette('navy');
        }}
      >
        Preferences
      </button>
    </>
  );
}

it('passes locale, density, router, CSP and theme settings through', () => {
  const writes = vi.spyOn(Storage.prototype, 'setItem');
  render(
    <KitProvider
      i18n={{ locale: 'es' }}
      density="compact"
      link={(props) => <a {...props} data-router="yes" />}
      csp={{ nonce: 'test-nonce' }}
      theme={{ storageKey: null, motionStorageKey: null }}
    >
      <Settings />
    </KitProvider>,
  );
  expect(screen.getByText('Cancelar:compact:test-nonce')).toHaveTextContent('Cancelar:compact:test-nonce');
  expect(screen.getByRole('link', { name: 'Route' })).toHaveAttribute('data-router', 'yes');
  fireEvent.click(screen.getByRole('button', { name: 'Preferences' }));
  expect(document.documentElement).not.toHaveClass('dark');
  expect(writes).not.toHaveBeenCalled();
  writes.mockRestore();
});

it('omits disabled toast and announcer providers so an app can supply its own', async () => {
  render(
    <ToastProvider>
      <KitProvider toast={false} announcer={false} tooltip={false}>
        <Actions />
        <Toaster />
      </KitProvider>
    </ToastProvider>,
  );
  expect(document.querySelector('[data-live-announcer]')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'dark/gntik' }));
  expect(await screen.findByText('Saved')).toBeVisible();
  expect(screen.getAllByRole('region', { name: 'Notifications' })).toHaveLength(1);
});

function AppActions() {
  const { toast, confirm, announce } = useApp();
  const [result, setResult] = useState('pending');
  return (
    <>
      <button
        onClick={() => {
          toast.add({ title: 'App saved' });
          announce('App moved');
        }}
      >
        Save
      </button>
      <button onClick={() => void confirm('Delete project?').then((value) => setResult(String(value)))}>Delete</button>
      <output>{result}</output>
    </>
  );
}

it('exposes toast, announce and confirm with both promise outcomes', async () => {
  render(
    <KitProvider>
      <AppActions />
    </KitProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('App saved')).toBeVisible();
  expect(document.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('App moved');
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(await screen.findByRole('alertdialog')).toHaveTextContent('Delete project?');
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(await screen.findByText('true')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  expect(await screen.findByText('false')).toBeVisible();
});

it('names KitProvider when useApp is used outside it', () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<AppActions />)).toThrow(/KitProvider/);
  errors.mockRestore();
});

function DensityLabel({ label }: { label: string }) {
  const density = useDensity();
  const { resolved } = useTheme();
  return (
    <span>
      {label}:{density}:{resolved}
    </span>
  );
}

it('nested providers inherit theme and reuse the toast, dialogs and announcement singletons', async () => {
  render(
    <KitProvider theme={{ forcedMode: 'light' }}>
      <DensityLabel label="outer" />
      <KitProvider density="compact">
        <DensityLabel label="inner" />
        <AppActions />
      </KitProvider>
    </KitProvider>,
  );
  expect(screen.getByText('outer:comfortable:light')).toBeVisible();
  expect(screen.getByText('inner:compact:light')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('App saved')).toBeVisible();
  expect(screen.getAllByRole('region', { name: 'Notifications' })).toHaveLength(1);
  expect(document.querySelectorAll('[data-live-announcer]')).toHaveLength(2);
});

it('nested providers preserve the outer tooltip timing unless explicitly configured', async () => {
  const user = userEvent.setup();
  render(
    <KitProvider tooltip={{ delay: 0 }}>
      <KitProvider>
        <Tooltip>
          <TooltipTrigger>Timing</TooltipTrigger>
          <TooltipContent>Inherited timing</TooltipContent>
        </Tooltip>
      </KitProvider>
    </KitProvider>,
  );
  await user.hover(screen.getByRole('button', { name: 'Timing' }));
  expect(screen.getByRole('tooltip')).toHaveTextContent('Inherited timing');
});

it('toast=false leaves announcements enabled and announcer=false leaves the toast stack enabled', () => {
  const first = render(
    <KitProvider toast={false}>
      <span>First</span>
    </KitProvider>,
  );
  expect(document.querySelectorAll('[data-live-announcer]')).toHaveLength(2);
  expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull();
  first.unmount();
  render(
    <KitProvider announcer={false}>
      <span>Second</span>
    </KitProvider>,
  );
  expect(document.querySelector('[data-live-announcer]')).toBeNull();
  expect(screen.getAllByRole('region', { name: 'Notifications' })).toHaveLength(1);
});

it('tooltip=false preserves an app-owned tooltip provider', async () => {
  const user = userEvent.setup();
  render(
    <TooltipProvider delay={0}>
      <KitProvider tooltip={false}>
        <Tooltip>
          <TooltipTrigger>Own timing</TooltipTrigger>
          <TooltipContent>App hint</TooltipContent>
        </Tooltip>
      </KitProvider>
    </TooltipProvider>,
  );
  await user.hover(screen.getByRole('button', { name: 'Own timing' }));
  expect(screen.getByRole('tooltip')).toHaveTextContent('App hint');
});

it('reuses an app-owned live announcer', async () => {
  render(
    <LiveAnnouncer>
      <KitProvider>
        <Actions />
      </KitProvider>
    </LiveAnnouncer>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'dark/gntik' }));
  expect(await screen.findByText('Saved')).toBeVisible();
  expect(document.querySelectorAll('[data-live-announcer]')).toHaveLength(2);
  expect(document.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('Moved');
});

it('passes toast queue and toaster options to the single stack', async () => {
  render(
    <KitProvider toast={{ timeout: 0, toaster: { closeLabel: 'Close notice', className: 'rounded-lg' } }}>
      <Actions />
    </KitProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'dark/gntik' }));
  expect(await screen.findByText('Saved')).toBeVisible();
  expect(screen.getByRole('region', { name: 'Notifications' })).toHaveClass('rounded-lg');
  fireEvent.keyDown(document.body, { key: 'F6' });
  expect(await screen.findByRole('button', { name: 'Close notice' })).toBeVisible();
});
