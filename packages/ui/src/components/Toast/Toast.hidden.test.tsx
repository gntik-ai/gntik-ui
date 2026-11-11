import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { I18nProvider } from '../../i18n/I18nProvider';
import { axeViolations } from '../../test/a11y';
import { Button } from '../Button';
import { ToastProvider, Toaster, useToast } from './Toast';

function Buttons() {
  const toast = useToast();
  return (
    <>
      <Button onClick={() => toast.add({ title: 'Settings saved', timeout: 0 })}>Normal</Button>
      <Button
        onClick={() =>
          toast.add({
            tone: 'destructive',
            priority: 'high',
            title: 'Rotation failed',
            description: <a href="/runbook">Open the runbook</a>,
            action: { label: 'Retry', onClick: () => {} },
            dismissAction: { label: 'Not now' },
            timeout: 0,
          })
        }
      >
        Urgent
      </Button>
    </>
  );
}

function Late() {
  const toast = useToast();
  return (
    <Button
      onClick={() =>
        toast.add({ tone: 'destructive', priority: 'high', title: 'Late', description: <LateLink />, timeout: 0 })
      }
    >
      Raise
    </Button>
  );
}

const runbookSetters = new Set<() => void>();

/** A description that turns an existing anchor into a link through its own state, not through the toast. */
function LateLink() {
  const [href, setHref] = useState<string | undefined>(undefined);
  useEffect(() => {
    const enable = () => setHref('/runbook');
    runbookSetters.add(enable);
    return () => void runbookSetters.delete(enable);
  }, []);
  return <a href={href}>Late runbook</a>;
}

function Fixture({ locale = 'en' }: { locale?: string }) {
  return (
    <I18nProvider locale={locale}>
      <ToastProvider>
        <Buttons />
        <Toaster />
      </ToastProvider>
    </I18nProvider>
  );
}

async function showBoth(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Normal' }));
  await user.click(screen.getByRole('button', { name: 'Urgent' }));
  const region = await screen.findByRole('region', { name: /Notifications|Notificaciones/ });
  await waitFor(() => expect(region.querySelectorAll('[role=dialog],[role=alertdialog]')).toHaveLength(2));
  return region;
}

const TABBABLE =
  'a[href]:not([tabindex="-1"]),button:not([tabindex="-1"]),input:not([tabindex="-1"]),select:not([tabindex="-1"]),textarea:not([tabindex="-1"]),[tabindex]:not([tabindex="-1"])';

describe('Toast hidden from assistive technology', () => {
  it.each(['en', 'es'])('keeps aria-hidden toasts and their controls out of the tab order (%s)', async (locale) => {
    const user = userEvent.setup();
    render(<Fixture locale={locale} />);
    const region = await showBoth(user);
    const hidden = Array.from(region.querySelectorAll('[aria-hidden="true"]'));
    expect(hidden.length).toBeGreaterThan(0);
    for (const el of hidden) {
      // Decorative icons are not focusable; every hidden focusable must opt out of sequential focus.
      if (el.matches('button,[role=alertdialog],[role=dialog]')) expect(el).toHaveAttribute('tabindex', '-1');
      expect(el.querySelectorAll(TABBABLE)).toHaveLength(0);
    }
    expect(await axeViolations()).toEqual([]);
  });

  it('links inside a hidden toast description are out of the tab order and restored on F6', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const region = await showBoth(user);
    const link = within(region).getByText('Open the runbook');
    expect(link.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(link).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(document.body, { key: 'F6' });
    await waitFor(() => expect(link.closest('[aria-hidden="true"]')).toBeNull());
    expect(link).not.toHaveAttribute('tabindex');
    expect(link).not.toHaveAttribute('data-gntik-toast-tabindex');
  });

  it('a link that becomes focusable inside a hidden toast through its own update is guarded', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="en">
        <ToastProvider>
          <Button onClick={() => undefined}>Page</Button>
          <Late />
          <Toaster />
        </ToastProvider>
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Raise' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    const link = await within(region).findByText('Late runbook');
    expect(link.closest('[aria-hidden="true"]')).not.toBeNull();
    act(() => runbookSetters.forEach((enable) => enable()));
    await waitFor(() => expect(link).toHaveAttribute('href', '/runbook'));
    await waitFor(() => expect(link).toHaveAttribute('tabindex', '-1'));
    expect(link.closest('[aria-hidden="true"]')).not.toBeNull();
    fireEvent.keyDown(document.body, { key: 'F6' });
    await waitFor(() => expect(link.closest('[aria-hidden="true"]')).toBeNull());
    expect(link).not.toHaveAttribute('tabindex');
  });

  it('Tab from the page never lands inside a hidden toast', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const region = await showBoth(user);
    (document.activeElement as HTMLElement | null)?.blur();
    for (let i = 0; i < 8; i++) {
      await user.tab();
      const active = document.activeElement;
      if (!active || !region.contains(active)) continue;
      expect(active.closest('[aria-hidden="true"]')).toBeNull();
    }
  });

  it('collapsed close buttons are tabindex -1 and recover when the stack expands', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const region = await showBoth(user);
    const normal = within(region).getByRole('dialog', { name: 'Settings saved' });
    const close = normal.querySelector('button[aria-label="Dismiss notification"]') as HTMLElement;
    expect(close).toHaveAttribute('aria-hidden', 'true');
    expect(close).toHaveAttribute('tabindex', '-1');
    fireEvent.mouseEnter(region);
    await waitFor(() => expect(close).toHaveAttribute('aria-hidden', 'false'));
    expect(close).not.toHaveAttribute('tabindex', '-1');
  });

  it('F6 restores the high-priority toast and its controls to the tab order', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const region = await showBoth(user);
    const urgent = within(region).getByRole('alertdialog', { hidden: true });
    expect(urgent).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(document.body, { key: 'F6' });
    await waitFor(() => expect(region).toHaveFocus());
    await waitFor(() => expect(urgent).not.toHaveAttribute('aria-hidden', 'true'));
    expect(urgent).toHaveAttribute('tabindex', '0');
    const urgentButtons = within(urgent).getAllByRole('button');
    for (const b of urgentButtons) expect(b).not.toHaveAttribute('tabindex', '-1');
    const retry = within(urgent).getByRole('button', { name: 'Retry' });
    const dismiss = within(urgent).getByRole('button', { name: 'Dismiss notification' });
    const reached = new Set<Element | null>();
    for (let i = 0; i < 8; i++) {
      await user.tab();
      reached.add(document.activeElement);
    }
    expect(reached.has(retry)).toBe(true);
    expect(reached.has(dismiss)).toBe(true);
  });

  it('a visible normal-priority toast keeps tabindex 0 and its close button still works', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole('button', { name: 'Normal' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    const normal = await within(region).findByRole('dialog', { name: 'Settings saved' });
    expect(normal).toHaveAttribute('tabindex', '0');
    fireEvent.mouseEnter(region);
    await user.click(within(normal).getByRole('button', { name: 'Dismiss notification' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Settings saved' })).not.toBeInTheDocument());
  });

  it('pointer interaction is not blocked on a hidden high-priority toast', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const region = await showBoth(user);
    const urgent = within(region).getByRole('alertdialog', { hidden: true });
    expect(urgent).not.toHaveAttribute('inert');
    fireEvent.mouseEnter(region);
    await user.click(within(urgent).getByRole('button', { name: 'Retry', hidden: true }));
    await waitFor(() => expect(screen.queryByRole('alertdialog', { hidden: true })).not.toBeInTheDocument());
  });
});
