import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IssueOnClick from './examples/IssueOnClick';
import { freshDisclosure } from './fixtures';
import type { CredentialDisclosure } from './CredentialDisclosureDialog';

it.each(['cancel', 'unmount', 'supersede'] as const)('ignores a deferred issuance after %s', async (action) => {
  const user = userEvent.setup();
  const results: ((value: CredentialDisclosure) => void)[] = [];
  const signals: AbortSignal[] = [];
  const request = vi.fn((signal: AbortSignal) => {
    signals.push(signal);
    return new Promise<CredentialDisclosure>((resolve) => results.push(resolve));
  });
  const { unmount } = render(<IssueOnClick request={request} />);
  await user.click(screen.getByRole('button', { name: 'Issue credential' }));
  if (action === 'unmount') unmount();
  else
    await user.click(
      screen.getByRole('button', { name: action === 'cancel' ? 'Cancel request' : 'Supersede request' }),
    );
  expect(signals[0]!.aborted).toBe(true);
  await act(async () => results[0]!(freshDisclosure));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.textContent).not.toContain(freshDisclosure.secret);
  if (action === 'supersede') {
    await act(async () => results[1]!({ ...freshDisclosure, secret: 'synthetic_current_response' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show secret' }));
    expect(screen.getByRole('textbox')).toHaveValue('synthetic_current_response');
  }
});

it('keeps disclosure null on failure and shows only a caller-owned error', async () => {
  const user = userEvent.setup();
  render(<IssueOnClick request={() => Promise.reject(new Error('409 DB_SHARED_MODE synthetic_not_for_display'))} />);
  await user.click(screen.getByRole('button', { name: 'Issue credential' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No credential was disclosed.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.textContent).not.toContain('DB_SHARED_MODE');
});
