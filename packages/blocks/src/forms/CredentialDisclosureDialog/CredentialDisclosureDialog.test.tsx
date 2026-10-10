import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { CredentialDisclosureDialog, type CredentialDisclosure, type CredentialDisclosureDialogProps } from './CredentialDisclosureDialog';

const stored: CredentialDisclosure = { variant: 'stored', credentialId: 'cred_demo_01', expiresAt: 'January 1, 2030', secret: 'synthetic_secret_for_tests_only' };

function RequestHarness({ request }: { request: () => Promise<CredentialDisclosure> }) {
  const [disclosure, setDisclosure] = useState<CredentialDisclosure | null>(null);
  return <><button onClick={() => { void request().then(setDisclosure).catch(() => {}); }}>Request</button><CredentialDisclosureDialog disclosure={disclosure} onClose={() => setDisclosure(null)} /></>;
}

it('renders nothing until a successful response, including pending and rejected requests', async () => {
  const user = userEvent.setup();
  let resolve!: (value: CredentialDisclosure) => void;
  let reject!: (reason: Error) => void;
  const pending = new Promise<CredentialDisclosure>((yes, no) => { resolve = yes; reject = no; });
  const { rerender } = render(<RequestHarness request={() => pending} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.innerHTML).not.toContain(stored.secret);
  await user.click(screen.getByRole('button', { name: 'Request' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await act(async () => reject(new Error('Synthetic rejection')));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.innerHTML).not.toContain(stored.secret);
  const success = new Promise<CredentialDisclosure>((yes) => { resolve = yes; });
  rerender(<RequestHarness request={() => success} />);
  await user.click(screen.getByRole('button', { name: 'Request' }));
  await act(async () => resolve(stored));
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(document.body.innerHTML).not.toContain(stored.secret);
});

const labels = { title: 'Credential value', description: 'Keep this value safe.', credentialIdLabel: 'Identifier', expiryLabel: 'Valid until', secretLabel: 'Secret value', showLabel: 'Reveal value', hideLabel: 'Mask value', copyLabel: 'Copy value', copiedLabel: 'Saved', successAnnouncement: 'Value saved safely', failureAnnouncement: 'Select and copy manually.', closeLabel: 'Dismiss' };

it('renders caller labels, copies the real stored value, and resets masking and feedback on reopening or replacement', async () => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const onClose = vi.fn();
  const { rerender } = render(<CredentialDisclosureDialog disclosure={stored} onClose={onClose} {...labels} />);
  const dialog = await screen.findByRole('dialog', { name: labels.title });
  expect(dialog).toHaveAccessibleDescription(labels.description);
  const dl = dialog.querySelector('dl');
  expect(dl).toHaveTextContent('Identifier');
  expect(dl).toHaveTextContent(stored.credentialId);
  expect(dl).toHaveTextContent('Valid until');
  expect(dl).toHaveTextContent('January 1, 2030');
  expect(document.body.innerHTML).not.toContain(stored.secret);
  await user.click(screen.getByRole('button', { name: labels.showLabel }));
  expect(screen.getByRole('button', { name: labels.hideLabel })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('textbox', { name: labels.secretLabel })).toHaveValue(stored.secret);
  await user.click(screen.getByRole('button', { name: labels.copyLabel }));
  expect(writeText).toHaveBeenCalledWith(stored.secret);
  expect(screen.getByRole('status')).toHaveTextContent(labels.successAnnouncement);
  expect(screen.getByRole('button', { name: labels.copiedLabel })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: labels.closeLabel }));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(document.body.innerHTML).not.toContain(stored.secret);
  rerender(<CredentialDisclosureDialog disclosure={null} onClose={onClose} {...labels} />);
  rerender(<CredentialDisclosureDialog disclosure={stored} onClose={onClose} {...labels} />);
  await screen.findByRole('dialog');
  expect(screen.getByRole('button', { name: labels.showLabel })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  await user.click(screen.getByRole('button', { name: labels.showLabel }));
  await user.click(screen.getByRole('button', { name: labels.copyLabel }));
  rerender(<CredentialDisclosureDialog disclosure={{ ...stored, secret: 'synthetic_replacement_value' }} onClose={onClose} {...labels} />);
  expect(screen.getByRole('button', { name: labels.showLabel })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(document.body.innerHTML).not.toContain('synthetic_replacement_value');
  await user.click(screen.getByRole('button', { name: labels.showLabel }));
  rerender(<CredentialDisclosureDialog disclosure={{ ...stored, credentialId: 'cred_demo_02' }} onClose={onClose} {...labels} />);
  expect(screen.getByRole('button', { name: labels.showLabel })).toHaveAttribute('aria-pressed', 'false');
});

it('shows a fresh secret with one kit copy action and replacement warning, and discards it on dismissal', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const fresh: CredentialDisclosure = { ...stored, variant: 'fresh' };
  const { rerender } = render(<CredentialDisclosureDialog disclosure={fresh} onClose={onClose} {...labels} warningTitle="Replacement" warningText="This value replaces the previous secret." />);
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('region', { name: labels.secretLabel })).toHaveTextContent(stored.secret);
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Replacement');
  expect(within(dialog).getByRole('alert')).toHaveTextContent('This value replaces the previous secret.');
  expect(screen.getAllByRole('button', { name: labels.copyLabel })).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: labels.closeLabel }));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(document.body.innerHTML).not.toContain(stored.secret);
  rerender(<CredentialDisclosureDialog disclosure={null} onClose={onClose} {...labels} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.innerHTML).not.toContain(stored.secret);
  expect(onClose).toHaveBeenCalledTimes(1);
});

function FocusHarness({ triggerVersion = 0, disclosureVersion = 0, resolveReturnFocus, fallbackFocus }: Pick<CredentialDisclosureDialogProps, 'resolveReturnFocus' | 'fallbackFocus'> & { triggerVersion?: number; disclosureVersion?: number }) {
  const [disclosure, setDisclosure] = useState<CredentialDisclosure | null>(null);
  return <><h1 id="fallback" tabIndex={-1}>Credentials</h1><button key={triggerVersion} id="opener" onClick={() => setDisclosure(stored)}>Open</button><div><button id="return">Return action</button></div><CredentialDisclosureDialog disclosure={disclosure && { ...disclosure, secret: disclosureVersion ? "synthetic_new_value" : disclosure.secret }} onClose={() => setDisclosure(null)} resolveReturnFocus={resolveReturnFocus} fallbackFocus={fallbackFocus} {...labels} /></>;
}

it('focuses the popup, traps Tab, closes on Escape and resolves the live replaced trigger at close time', async () => {
  const user = userEvent.setup();
  const resolveReturnFocus = vi.fn(() => document.getElementById('opener'));
  const props = { resolveReturnFocus, fallbackFocus: () => document.getElementById('fallback') };
  const { rerender } = render(<FocusHarness {...props} />);
  const oldTrigger = screen.getByRole('button', { name: 'Open' });
  await user.click(oldTrigger);
  const dialog = await screen.findByRole('dialog');
  await waitFor(() => expect(dialog).toHaveFocus());
  for (let index = 0; index < 8; index++) {
    await user.tab();
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  }
  await user.tab({ shift: true });
  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  rerender(<FocusHarness {...props} triggerVersion={1} />);
  expect(oldTrigger.isConnected).toBe(false);
  expect(resolveReturnFocus).not.toHaveBeenCalled();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus());
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it.each(['null', 'detached', 'disabled', 'removed', 'hidden', 'inert', 'nonfocusable', 'hidden-parent', 'disabled-fieldset'] as const)('uses the fallback heading for a %s return target', async (reason) => {
  const user = userEvent.setup();
  const resolveReturnFocus = () => reason === 'null' ? null : reason === 'detached' ? document.createElement('button') : document.getElementById('return');
  render(<FocusHarness resolveReturnFocus={resolveReturnFocus} fallbackFocus={() => document.getElementById('fallback')} />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await screen.findByRole('dialog');
  const target = document.getElementById('return')!;
  if (reason === 'disabled') target.setAttribute('disabled', '');
  if (reason === 'removed') target.remove();
  if (reason === 'hidden') target.hidden = true;
  if (reason === 'inert') target.setAttribute('inert', '');
  if (reason === 'nonfocusable') { const span = document.createElement('span'); span.id = 'return'; target.replaceWith(span); }
  if (reason === 'hidden-parent' || reason === 'disabled-fieldset') {
    const wrapper = document.createElement(reason === 'hidden-parent' ? 'div' : 'fieldset');
    if (reason === 'hidden-parent') wrapper.style.display = 'none';
    else wrapper.setAttribute('disabled', '');
    target.before(wrapper); wrapper.append(target);
  }
  await user.click(screen.getByRole('button', { name: labels.closeLabel }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Credentials' })).toHaveFocus());
});

it.each(['null', 'detached', 'disabled', 'hidden', 'inert', 'nonfocusable'] as const)('returns to the original opener for a %s fallback', async (reason) => {
  const user = userEvent.setup();
  const fallbackFocus = () => reason === 'null' ? null : reason === 'detached' ? document.createElement('h1') : document.getElementById('fallback');
  render(<FocusHarness resolveReturnFocus={() => null} fallbackFocus={fallbackFocus} />);
  const opener = screen.getByRole('button', { name: 'Open' });
  await user.click(opener);
  await screen.findByRole('dialog');
  const heading = document.getElementById('fallback')!;
  if (reason === 'disabled') heading.setAttribute('aria-disabled', 'true');
  if (reason === 'hidden') heading.hidden = true;
  if (reason === 'inert') heading.setAttribute('inert', '');
  if (reason === 'nonfocusable') heading.removeAttribute('tabindex');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(opener).toHaveFocus());
});

it.each([['stored', 'rejected'], ['stored', 'missing'], ['fresh', 'rejected'], ['fresh', 'missing']] as const)('announces %s clipboard %s politely, without logging secrets', async (variant, clipboard) => {
  const user = userEvent.setup();
  const logs = [vi.spyOn(console, 'log'), vi.spyOn(console, 'info'), vi.spyOn(console, 'warn'), vi.spyOn(console, 'error'), vi.spyOn(console, 'debug')];
  const writeText = vi.fn().mockRejectedValue(new Error('Synthetic clipboard denial'));
  Object.defineProperty(navigator, 'clipboard', { value: clipboard === 'missing' ? undefined : { writeText }, configurable: true });
  Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true });
  render(<CredentialDisclosureDialog disclosure={{ ...stored, variant }} onClose={() => {}} {...labels} />);
  await screen.findByRole('dialog');
  const feedback = document.querySelector('[data-live-announcer="polite"]');
  expect(feedback).toBeEmptyDOMElement();
  await user.click(screen.getByRole('button', { name: labels.copyLabel }));
  expect(feedback).toHaveAttribute('aria-live', 'polite');
  expect(feedback).toHaveTextContent(labels.failureAnnouncement);
  expect(document.querySelector('[data-live-announcer="assertive"]')).toBeEmptyDOMElement();
  if (clipboard === 'rejected') expect(writeText).toHaveBeenCalledWith(stored.secret);
  else expect(writeText).not.toHaveBeenCalled();
  expect(document.querySelector('textarea')).toBeNull();
  for (const log of logs) {
    expect(log.mock.calls.flat().some((value) => typeof value === 'string' && value.includes(stored.secret))).toBe(false);
    log.mockRestore();
  }
});

it.each(['stored', 'fresh'] as const)('%s has no axe violations in all three themes', async (variant) => {
  render(<CredentialDisclosureDialog disclosure={{ ...stored, variant }} onClose={() => {}} />);
  const dialog = await screen.findByRole('dialog');
  for (const theme of ['dark', 'light', 'high_contrast']) {
    document.documentElement.className = theme;
    await expectNoAxeViolations(dialog);
  }
});


it('preserves the original opener when the credential value changes while open', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<FocusHarness resolveReturnFocus={() => null} fallbackFocus={() => null} />);
  const opener = screen.getByRole('button', { name: 'Open' });
  await user.click(opener);
  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
  rerender(<FocusHarness disclosureVersion={1} resolveReturnFocus={() => null} fallbackFocus={() => null} />);
  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
  await user.keyboard('{Escape}');
  await waitFor(() => expect(opener).toHaveFocus());
});
