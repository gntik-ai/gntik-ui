import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { CredentialDisclosureDialog } from './CredentialDisclosureDialog';
import { storedDisclosure } from './fixtures';
import { expectNoAxeViolations } from '../../test/a11y';

const additionalSecrets = [
  { id: 'dsn', label: 'DSN', value: 'synthetic_dsn_value' },
  { id: 'password', label: 'Password', value: 'synthetic_password_value' },
];

it.each([
  ['en', 'DSN: Copied'],
  ['es', 'DSN: Copiado'],
  ['override', 'Saved DSN'],
])('masks independent additional secrets and copies with label-only feedback (%s)', async (locale, announcement) => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const onCopy = vi.fn();
  render(
    <I18nProvider locale={locale!}>
      <CredentialDisclosureDialog
        disclosure={storedDisclosure}
        onClose={() => {}}
        additionalSecrets={additionalSecrets}
        showLabel="Reveal"
        hideLabel="Hide"
        copyLabel="Copy"
        onCopy={onCopy}
        successAnnouncement="Unused single-secret feedback"
        copiedAnnouncementFor={locale === 'override' ? (label) => `Saved ${label}` : undefined}
      />
    </I18nProvider>,
  );
  const dsn = await screen.findByRole('group', { name: 'DSN' });
  const password = screen.getByRole('group', { name: 'Password' });
  expect(within(dsn).getByRole('textbox')).not.toHaveValue(additionalSecrets[0]!.value);
  await user.click(within(dsn).getByRole('button', { name: 'Reveal' }));
  expect(within(dsn).getByRole('textbox')).toHaveValue(additionalSecrets[0]!.value);
  expect(within(password).getByRole('button', { name: 'Reveal' })).toHaveAttribute('aria-pressed', 'false');
  await user.click(within(dsn).getByRole('button', { name: 'Copy' }));
  expect(writeText).toHaveBeenCalledWith('synthetic_dsn_value');
  expect(onCopy).toHaveBeenCalledExactlyOnceWith('dsn');
  expect(within(dsn).getByRole('status').textContent).toBe(announcement);
  expect(within(dsn).getByRole('textbox').closest('[data-kit-redact]')).not.toBeNull();
  expect(within(dsn).getByRole('status')).not.toHaveTextContent('synthetic_');
});

it('masks a fresh primary for the session and redacts the reveal slot, keeping its warning', async () => {
  const user = userEvent.setup();
  const props = { disclosure: { ...storedDisclosure, variant: 'fresh' as const }, onClose: vi.fn() };
  const { rerender } = render(
    <CredentialDisclosureDialog {...props} maskFresh revealContent={<p>synthetic_slot_value</p>} />,
  );
  await screen.findByRole('dialog');
  expect(screen.getByRole('button', { name: 'Show secret' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('synthetic_slot_value').closest('[data-kit-redact]')).not.toBeNull();
  rerender(<CredentialDisclosureDialog {...props} maskFresh={false} />);
  expect(screen.getByRole('button', { name: 'Show secret' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Show secret' }));
  expect(screen.getByRole('textbox').closest('[data-kit-redact]')).not.toBeNull();
});

it.each(['stored', 'masked-fresh', 'fresh'] as const)(
  'dismisses retained %s props and resets a cleared or changed session in both presentations',
  async (kind) => {
    const user = userEvent.setup();
    for (const presentation of ['dialog', 'inline'] as const) {
      const props = {
        disclosure: { ...storedDisclosure, variant: kind === 'stored' ? ('stored' as const) : ('fresh' as const) },
        maskFresh: kind === 'masked-fresh',
        presentation,
        onClose: vi.fn(),
      };
      const { rerender, unmount } = render(<CredentialDisclosureDialog {...props} />);
      await screen.findByRole(presentation === 'dialog' ? 'dialog' : 'region', { name: 'Credential secret' });
      if (kind !== 'fresh') await user.click(screen.getByRole('button', { name: 'Show secret' }));
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(props.onClose).toHaveBeenCalledOnce();
      rerender(<CredentialDisclosureDialog {...props} />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(document.body.textContent).not.toContain(storedDisclosure.secret);
      rerender(<CredentialDisclosureDialog {...props} disclosure={null} />);
      rerender(<CredentialDisclosureDialog {...props} />);
      await screen.findByRole(presentation === 'dialog' ? 'dialog' : 'region', { name: 'Credential secret' });
      if (kind !== 'fresh') {
        expect(screen.getByRole('button', { name: 'Show secret' })).toHaveAttribute('aria-pressed', 'false');
        await user.click(screen.getByRole('button', { name: 'Show secret' }));
      } else expect(screen.getByRole('region', { name: 'Secret' })).toHaveTextContent(storedDisclosure.secret);
      rerender(
        <CredentialDisclosureDialog {...props} disclosure={{ ...props.disclosure, secret: 'synthetic_replaced' }} />,
      );
      if (kind !== 'fresh')
        expect(screen.getByRole('button', { name: 'Show secret' })).toHaveAttribute('aria-pressed', 'false');
      unmount();
    }
  },
);

it('renders an inline named section without moving focus, trapping Tab or handling Escape; presentation is fixed per opening', async () => {
  const user = userEvent.setup();
  const outside = document.createElement('button');
  document.body.append(outside);
  outside.focus();
  const onClose = vi.fn();
  const props = {
    disclosure: { ...storedDisclosure, variant: 'fresh' as const },
    onClose,
    title: 'Inline credentials',
    presentation: 'inline' as const,
  };
  const { rerender, unmount } = render(<CredentialDisclosureDialog {...props} />);
  const section = screen.getByRole('region', { name: 'Inline credentials' });
  expect(section.tagName).toBe('SECTION');
  expect(outside).toHaveFocus();
  expect(screen.getByRole('note')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  expect(onClose).not.toHaveBeenCalled();
  rerender(<CredentialDisclosureDialog {...props} presentation="dialog" />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const close = screen.getByRole('button', { name: 'Close' });
  close.focus();
  await user.tab();
  expect(section.contains(document.activeElement)).toBe(false);
  await user.click(close);
  expect(outside).toHaveFocus();
  unmount();
  outside.remove();
});

it.each(['inline', 'dialog'] as const)(
  'preserves surviving focus and recovers removed slot/session focus (%s)',
  async (presentation) => {
    const outside = document.createElement('button');
    document.body.append(outside);
    const props = {
      disclosure: storedDisclosure,
      onClose: vi.fn(),
      presentation,
      revealContent: <button>Slot action</button>,
    };
    const { rerender, unmount } = render(<CredentialDisclosureDialog {...props} />);
    await screen.findByRole(presentation === 'dialog' ? 'dialog' : 'region', { name: 'Credential secret' });
    const copy = screen.getByRole('button', { name: 'Copy secret' });
    copy.focus();
    rerender(<CredentialDisclosureDialog {...props} revealContent={<button>Replacement slot</button>} />);
    expect(copy).toHaveFocus();
    screen.getByRole('button', { name: 'Replacement slot' }).focus();
    rerender(<CredentialDisclosureDialog {...props} revealContent={null} />);
    const fallback = () =>
      presentation === 'dialog'
        ? screen.getByRole('dialog')
        : screen.getByRole('heading', { name: 'Credential secret' });
    expect(fallback()).toHaveFocus();
    screen.getByRole('button', { name: 'Show secret' }).focus();
    rerender(
      <CredentialDisclosureDialog {...props} disclosure={{ ...storedDisclosure, secret: 'synthetic_next_session' }} />,
    );
    await waitFor(() => expect(fallback()).toHaveFocus());
    unmount();
    outside.remove();
  },
);

it('leaves outside focus alone during inline updates and returns focused inline unmounts to a live fallback', () => {
  const outside = document.createElement('button');
  document.body.append(outside);
  outside.focus();
  const props = {
    disclosure: storedDisclosure,
    presentation: 'inline' as const,
    onClose: vi.fn(),
    resolveReturnFocus: () => null,
    fallbackFocus: () => outside,
  };
  const { rerender, unmount } = render(<CredentialDisclosureDialog {...props} revealContent={<button>Slot</button>} />);
  rerender(
    <CredentialDisclosureDialog
      {...props}
      revealContent={null}
      disclosure={{ ...storedDisclosure, secret: 'synthetic_changed' }}
    />,
  );
  expect(outside).toHaveFocus();
  screen.getByRole('button', { name: 'Copy secret' }).focus();
  unmount();
  expect(outside).toHaveFocus();
  outside.remove();
});

it('filters invalid ids and first duplicate wins; changed additional values reset every mask', async () => {
  const user = userEvent.setup();
  const entries = [
    { id: '', label: 'Empty', value: 'bad' },
    { id: 'secret', label: 'Reserved', value: 'bad' },
    ...additionalSecrets,
    { id: 'dsn', label: 'Duplicate', value: 'bad' },
  ];
  const props = { disclosure: storedDisclosure, onClose: vi.fn(), additionalSecrets: entries };
  const { rerender } = render(<CredentialDisclosureDialog {...props} />);
  await screen.findByRole('dialog');
  expect(screen.getAllByRole('group').map((node) => node.getAttribute('aria-label'))).toEqual([
    'Secret',
    'DSN',
    'Password',
  ]);
  await user.click(within(screen.getByRole('group', { name: 'DSN' })).getByRole('button', { name: 'Show secret' }));
  rerender(
    <CredentialDisclosureDialog
      {...props}
      additionalSecrets={[{ ...additionalSecrets[0]!, value: 'synthetic_changed_dsn' }]}
    />,
  );
  for (const button of screen.getAllByRole('button', { name: 'Show secret' }))
    expect(button).toHaveAttribute('aria-pressed', 'false');
});

function observeAnnouncements() {
  const messages: string[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const region =
        record.target instanceof Element
          ? record.target.closest('[data-live-announcer]')
          : record.target.parentElement?.closest('[data-live-announcer]');
      if (region?.textContent) messages.push(region.textContent.trim());
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  return { messages, stop: () => observer.disconnect() };
}

it('announces each settled copy once, including repeats, failures and deferred attempts; serializes pending activations', async () => {
  const user = userEvent.setup();
  let settle!: () => void;
  const writeText = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const onCopy = vi.fn();
  render(
    <CredentialDisclosureDialog
      disclosure={storedDisclosure}
      onClose={() => {}}
      additionalSecrets={additionalSecrets}
      onCopy={onCopy}
    />,
  );
  const dsn = await screen.findByRole('group', { name: 'DSN' });
  const observation = observeAnnouncements();
  const button = within(dsn).getByRole('button', { name: 'Copy secret' });
  await user.click(button);
  await user.click(button);
  expect(observation.messages).toEqual(['DSN: Copied', 'DSN: Copied']);
  writeText.mockRejectedValueOnce(new Error('Synthetic denial'));
  await user.click(button);
  expect(observation.messages).toHaveLength(3);
  expect(observation.messages[2]).not.toContain('synthetic_');
  for (let attempt = 0; attempt < 2; attempt++) {
    writeText.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          settle = resolve;
        }),
    );
    await user.click(button);
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    await act(async () => settle());
  }
  expect(writeText).toHaveBeenCalledTimes(5);
  expect(onCopy).toHaveBeenCalledTimes(4);
  expect(observation.messages).toHaveLength(5);
  observation.stop();
});

it('announces two secrets settling in the same tick through separate regions', async () => {
  const user = userEvent.setup();
  const settlements: (() => void)[] = [];
  const writeText = vi.fn(() => new Promise<void>((resolve) => settlements.push(resolve)));
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const onCopy = vi.fn();
  render(
    <CredentialDisclosureDialog
      disclosure={storedDisclosure}
      onClose={() => {}}
      additionalSecrets={additionalSecrets}
      onCopy={onCopy}
    />,
  );
  await screen.findByRole('dialog');
  const observation = observeAnnouncements();
  await user.click(within(screen.getByRole('group', { name: 'Secret' })).getByRole('button', { name: 'Copy secret' }));
  await user.click(within(screen.getByRole('group', { name: 'DSN' })).getByRole('button', { name: 'Copy secret' }));
  await act(async () => settlements.forEach((resolve) => resolve()));
  expect(observation.messages.sort()).toEqual(['DSN: Copied', 'Secret: Copied']);
  expect(onCopy.mock.calls).toEqual([['secret'], ['dsn']]);
  observation.stop();
});

it('keeps synthetic values out of persistence, navigation, announcements and console across reveal/copy/close/remount', async () => {
  const user = userEvent.setup();
  const logs = ['log', 'info', 'warn', 'error', 'debug'].map((method) => vi.spyOn(console, method as 'log'));
  const localWrite = vi.spyOn(Storage.prototype, 'setItem');
  const cookieWrite = vi.spyOn(document, 'cookie', 'set');
  const push = vi.spyOn(history, 'pushState');
  const replace = vi.spyOn(history, 'replaceState');
  const indexedOpen = vi.fn();
  vi.stubGlobal('indexedDB', { open: indexedOpen });
  const initialLocation = location.href;
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  try {
    for (const presentation of ['dialog', 'inline'] as const) {
      const { unmount } = render(
        <CredentialDisclosureDialog
          disclosure={storedDisclosure}
          additionalSecrets={additionalSecrets}
          presentation={presentation}
          onClose={() => {}}
          revealContent={<p>synthetic_slot_value</p>}
        />,
      );
      await screen.findByRole(presentation === 'dialog' ? 'dialog' : 'region', { name: 'Credential secret' });
      for (const button of screen.getAllByRole('button', { name: 'Show secret' })) await user.click(button);
      for (const button of screen.getAllByRole('button', { name: 'Copy secret' })) await user.click(button);
      for (const textbox of screen.getAllByRole('textbox')) expect(textbox.closest('[data-kit-redact]')).not.toBeNull();
      for (const region of document.querySelectorAll('[data-live-announcer]'))
        expect(region.textContent).not.toContain('synthetic_');
      await user.click(screen.getByRole('button', { name: 'Close' }));
      unmount();
    }
    expect(localWrite).not.toHaveBeenCalled();
    expect(cookieWrite).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(location.href).toBe(initialLocation);
    for (const value of [
      JSON.stringify(Object.entries(localStorage)),
      JSON.stringify(Object.entries(sessionStorage)),
      document.cookie,
      JSON.stringify(history.state),
    ])
      expect(String(value)).not.toContain('synthetic_');
    for (const log of logs) expect(JSON.stringify(log.mock.calls)).not.toContain('synthetic_');
  } finally {
    logs.forEach((log) => log.mockRestore());
    localWrite.mockRestore();
    cookieWrite.mockRestore();
    push.mockRestore();
    replace.mockRestore();
    vi.unstubAllGlobals();
  }
});

it('returns modal focus when the caller clears disclosure directly', async () => {
  const outside = document.createElement('button');
  document.body.append(outside);
  outside.focus();
  const props = { disclosure: storedDisclosure, onClose: vi.fn(), resolveReturnFocus: () => outside };
  const { rerender } = render(<CredentialDisclosureDialog {...props} />);
  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
  rerender(<CredentialDisclosureDialog {...props} disclosure={null} />);
  await waitFor(() => expect(outside).toHaveFocus());
  outside.remove();
});

it('keeps single-secret defaults when no additional id is valid, including the fresh CodeBlock and announcement', async () => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const onCopy = vi.fn();
  render(
    <CredentialDisclosureDialog
      disclosure={{ ...storedDisclosure, variant: 'fresh' }}
      onClose={() => {}}
      additionalSecrets={[
        { id: '', label: 'Empty', value: 'bad' },
        { id: 'secret', label: 'Reserved', value: 'bad' },
      ]}
      copiedAnnouncementFor={() => 'Unused override'}
      onCopy={onCopy}
    />,
  );
  await screen.findByRole('dialog');
  const code = screen.getByRole('region', { name: 'Secret' });
  expect(code).toHaveTextContent(storedDisclosure.secret);
  expect(code.closest('[data-kit-redact]')).not.toBeNull();
  expect(screen.queryByRole('group')).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Copy secret' }));
  expect(document.querySelector('[data-live-announcer="polite"]')?.textContent).toBe('Secret copied to clipboard');
  expect(onCopy).toHaveBeenCalledExactlyOnceWith('secret');
});

it('does not claim focus when an unrelated focused control outside the inline section is removed', () => {
  const outside = document.createElement('button');
  document.body.append(outside);
  const props = { disclosure: storedDisclosure, presentation: 'inline' as const, onClose: vi.fn() };
  const { rerender } = render(<CredentialDisclosureDialog {...props} />);
  outside.focus();
  outside.remove();
  rerender(<CredentialDisclosureDialog {...props} revealContent={<p>Updated content</p>} />);
  expect(screen.getByRole('region', { name: 'Credential secret' }).contains(document.activeElement)).toBe(false);
});

it.each(['dialog', 'inline'] as const)('multi-secret %s is axe-clean in all three themes', async (presentation) => {
  const { unmount } = render(
    <CredentialDisclosureDialog
      disclosure={{ ...storedDisclosure, variant: 'fresh' }}
      presentation={presentation}
      maskFresh
      additionalSecrets={additionalSecrets}
      onClose={() => {}}
    />,
  );
  const surface = await screen.findByRole(presentation === 'dialog' ? 'dialog' : 'region', {
    name: 'Credential secret',
  });
  for (const theme of ['dark', 'light', 'high_contrast']) {
    document.documentElement.className = theme;
    await expectNoAxeViolations(surface);
  }
  unmount();
});
