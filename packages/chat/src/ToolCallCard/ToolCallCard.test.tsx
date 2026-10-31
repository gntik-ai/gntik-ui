import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { useLayoutEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import ToolCallCardStates from './examples/ToolCallCardStates';
import { ToolCallCard } from './ToolCallCard';

describe('ToolCallCard', () => {
  it('shows name, status and duration in its toggle', () => {
    render(
      <ToolCallCard name="search_invoices" status="succeeded" durationMs={840} args={{ a: 1 }} result={{ ok: true }} />,
    );
    const toggle = screen.getByRole('button', { name: /search_invoices/ });
    expect(toggle).toHaveTextContent('Called');
    expect(toggle).toHaveTextContent('Succeeded');
    expect(toggle).toHaveTextContent('840 ms');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('Enter and Space expand and collapse; arguments and result render as JSON', async () => {
    const user = userEvent.setup();
    render(
      <ToolCallCard
        name="list_deployments"
        status="succeeded"
        durationMs={2400}
        args={{ project: 'web-app' }}
        result={{ count: 3 }}
      />,
    );
    const toggle = screen.getByRole('button', { name: /list_deployments/ });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Arguments')).toHaveTextContent('"project": "web-app"');
    expect(screen.getByLabelText('Result')).toHaveTextContent('"count": 3');
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('JSON sections collapse on their own', async () => {
    const user = userEvent.setup();
    render(<ToolCallCard name="x" status="succeeded" defaultOpen args={{ a: 1 }} />);
    const section = screen.getByRole('button', { name: 'Arguments' });
    expect(section).toHaveAttribute('aria-expanded', 'true');
    await user.click(section);
    expect(section).toHaveAttribute('aria-expanded', 'false');
  });

  it('failed calls open by default and show the error as an alert', () => {
    render(<ToolCallCard name="invite_member" status="failed" error="Seat limit reached." />);
    expect(screen.getByRole('button', { name: /invite_member/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Seat limit reached.');
  });

  it('running calls show the running state', () => {
    render(<ToolCallCard name="sync" status="running" defaultOpen />);
    expect(screen.getByRole('button', { name: /sync/ })).toHaveTextContent('Calling');
    expect(screen.getByText('Waiting for the result…')).toBeInTheDocument();
  });

  it('example has no axe violations', async () => {
    const { container } = render(<ToolCallCardStates />);
    await expectNoAxeViolations(container);
  });
});

describe('ToolCallCard approval', () => {
  it.each(['Approve', 'Deny'])('guards same-batch %s activation even for synchronous callbacks', async (action) => {
    const handler = vi.fn();
    render(
      <ToolCallCard
        name="delete_project"
        status="awaiting-approval"
        onApprove={handler}
        onDeny={handler}
        askDenyReason={false}
      />,
    );
    const button = screen.getByRole('button', { name: action });
    await act(async () => {
      button.click();
      button.click();
    });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(button).not.toHaveAttribute('aria-busy');
  });

  it('uses the Spanish catalog for approval, denial, and destructive wording', async () => {
    const user = userEvent.setup();
    const view = (destructive = false) => (
      <I18nProvider locale="es">
        <ToolCallCard name="delete_project" status="awaiting-approval" destructive={destructive} />
      </I18nProvider>
    );
    const { rerender } = render(view());
    expect(screen.getByRole('button', { name: /Quiere llamar a/ })).toHaveTextContent('Requiere aprobación');
    expect(screen.getByRole('button', { name: 'Aprobar' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Denegar' }));
    expect(screen.getByRole('textbox', { name: 'Motivo (opcional)' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    rerender(view(true));
    expect(screen.getByRole('button', { name: 'Ejecutar delete_project' })).toBeVisible();
    expect(screen.getByRole('group', { name: '¿Permitir esta llamada?' })).toHaveAccessibleDescription(
      'Puede que esta acción no se pueda deshacer.',
    );
  });

  it('falls back to English when the UI catalog does not know the new keys', () => {
    render(
      <I18nProvider
        locale="en"
        messages={{
          'toolCall.awaitingApproval': 'toolCall.awaitingApproval',
          'toolCall.approveDestructive': 'toolCall.approveDestructive',
        }}
      >
        <ToolCallCard name="delete_project" status="awaiting-approval" destructive />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: /Wants to call/ })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Run delete_project' })).toBeVisible();
  });

  it.each(['dark', 'light', 'high_contrast'])('approval examples have no axe violations in %s', async (theme) => {
    const { container } = render(
      <div data-theme={theme}>
        <ToolCallCardStates />
      </div>,
    );
    await expectNoAxeViolations(container);
  });

  it('keeps denied decisions in the body and approved decisions above the result', () => {
    const { rerender } = render(
      <ToolCallCard name="delete_project" status="denied" decision={{ outcome: 'denied', reason: 'Wrong project' }} />,
    );
    const header = screen.getByRole('button', { name: /Denied call to delete_project/ });
    expect(header).toHaveTextContent('Denied');
    expect(screen.getByText('Denied: Wrong project')).toBeVisible();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    rerender(<ToolCallCard name="delete_project" status="denied" decision={{ outcome: 'denied' }} />);
    expect(screen.getAllByText('Denied')).toHaveLength(2);
    rerender(
      <ToolCallCard
        name="delete_project"
        status="succeeded"
        defaultOpen
        decision={{ outcome: 'approved' }}
        result={{ ok: true }}
      />,
    );
    const approved = screen.getByText('Approved');
    const result = screen.getByLabelText('Result');
    expect(approved).toBeVisible();
    expect(approved.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(['running', 'succeeded', 'failed', 'denied'] as const)(
    'never offers decisions for %s, even when handlers are supplied',
    (status) => {
      render(<ToolCallCard name="delete_project" status={status} onApprove={vi.fn()} onDeny={vi.fn()} defaultOpen />);
      expect(screen.queryByRole('group')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Deny' })).not.toBeInTheDocument();
    },
  );

  it('describes destructive approval and supports custom text and a rich prompt', () => {
    const { rerender } = render(<ToolCallCard name="delete_project" status="awaiting-approval" destructive />);
    expect(screen.getByRole('button', { name: 'Run delete_project' })).toHaveClass('bg-destructive');
    expect(screen.getByRole('group', { name: 'Allow this tool call?' })).toHaveAccessibleDescription(
      'This action may not be reversible.',
    );
    rerender(
      <ToolCallCard
        name="delete_project"
        status="awaiting-approval"
        destructive
        approveLabel="Run now"
        denyLabel="Keep project"
        approvalPrompt={<strong>Delete this project?</strong>}
      />,
    );
    expect(screen.getByRole('group', { name: 'Delete this project?' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Run now' })).toHaveAccessibleName('Run now');
    expect(screen.getByRole('button', { name: 'Keep project' })).toBeVisible();
  });

  it.each([
    [' Wrong project ', 'Wrong project'],
    ['', undefined],
  ])('denies once with the trimmed reason %j', async (input, expected) => {
    const user = userEvent.setup();
    const onDeny = vi.fn();
    render(<ToolCallCard name="delete_project" status="awaiting-approval" onDeny={onDeny} />);
    await user.click(screen.getByRole('button', { name: 'Deny' }));
    const reason = screen.getByRole('textbox', { name: 'Reason (optional)' });
    expect(reason).toHaveFocus();
    if (input) await user.type(reason, input);
    await user.keyboard('{Enter}');
    expect(onDeny).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it.each(['Escape', 'Cancel'])('%s cancels the reason locally and focuses Deny', async (method) => {
    const user = userEvent.setup();
    const onDeny = vi.fn();
    const parentKeyDown = vi.fn();
    render(
      <div onKeyDown={parentKeyDown}>
        <ToolCallCard name="delete_project" status="awaiting-approval" onDeny={onDeny} />
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Deny' }));
    const input = screen.getByRole('textbox', { name: 'Reason (optional)' });
    await user.type(input, 'Wrong project');
    parentKeyDown.mockClear();
    if (method === 'Escape') await user.keyboard('{Escape}');
    else await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deny' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeVisible();
    expect(onDeny).not.toHaveBeenCalled();
    expect(parentKeyDown).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Wants to call/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('denies immediately without a reason step when requested, guards pending denial and retries on rejection', async () => {
    const user = userEvent.setup();
    let reject!: (error: Error) => void;
    const pending = new Promise<void>((_, fail) => {
      reject = fail;
    });
    const onDeny = vi.fn(() => pending);
    render(<ToolCallCard name="delete_project" status="awaiting-approval" askDenyReason={false} onDeny={onDeny} />);
    const deny = screen.getByRole('button', { name: 'Deny' });
    const approve = screen.getByRole('button', { name: 'Approve' });
    act(() => {
      deny.click();
      deny.click();
    });
    expect(onDeny).toHaveBeenCalledExactlyOnceWith();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(deny).toHaveAttribute('aria-busy', 'true');
    for (const button of [approve, deny]) {
      expect(button).toHaveAttribute('aria-disabled', 'true');
      button.focus();
      expect(button).toHaveFocus();
    }
    await act(async () => {
      reject(new Error('Request failed'));
    });
    await waitFor(() => expect(deny).not.toHaveAttribute('aria-disabled', 'true'));
    expect(approve).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(deny);
    expect(onDeny).toHaveBeenCalledTimes(2);
  });

  it('keeps a pending reason submission busy and prevents repeated Enter or clicks', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const pending = new Promise<void>((done) => {
      resolve = done;
    });
    const onDeny = vi.fn(() => pending);
    render(<ToolCallCard name="delete_project" status="awaiting-approval" onDeny={onDeny} />);
    await user.click(screen.getByRole('button', { name: 'Deny' }));
    const reason = screen.getByRole('textbox', { name: 'Reason (optional)' });
    await user.type(reason, ' Wrong project ');
    await user.keyboard('{Enter}{Enter}');
    const deny = screen.getByRole('button', { name: 'Deny' });
    expect(deny).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(deny);
    fireEvent.keyDown(reason, { key: 'Escape' });
    expect(reason).toBeInTheDocument();
    expect(onDeny).toHaveBeenCalledExactlyOnceWith('Wrong project');
    await act(async () => {
      resolve();
    });
    expect(deny).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('runs approval once, keeps both busy actions focusable, and recovers after rejection', async () => {
    const user = userEvent.setup();
    let reject!: (reason: Error) => void;
    const pending = new Promise<void>((_, fail) => {
      reject = fail;
    });
    const onApprove = vi.fn(() => pending);
    const onDeny = vi.fn();
    render(<ToolCallCard name="delete_project" status="awaiting-approval" onApprove={onApprove} onDeny={onDeny} />);
    const approve = screen.getByRole('button', { name: 'Approve' });
    const deny = screen.getByRole('button', { name: 'Deny' });
    // Dispatch in one batch as well as through userEvent: the guard must work before a render.
    act(() => {
      approve.click();
      approve.click();
    });
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(approve).toHaveAttribute('aria-busy', 'true');
    for (const button of [approve, deny]) {
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toHaveAttribute('disabled');
      button.focus();
      expect(button).toHaveFocus();
    }
    await user.click(deny);
    await user.click(approve);
    expect(onDeny).not.toHaveBeenCalled();
    expect(onApprove).toHaveBeenCalledTimes(1);
    await act(async () => {
      reject(new Error('Request failed'));
    });
    await waitFor(() => expect(approve).not.toHaveAttribute('aria-disabled', 'true'));
    expect(deny).not.toHaveAttribute('aria-disabled', 'true');
    expect(approve).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('button', { name: /Wants to call/ })).toBeInTheDocument();
  });

  it('opens arguments and offers approval outside the header, including when controlled closed', () => {
    const { rerender } = render(<ToolCallCard name="delete_project" status="awaiting-approval" args={{ id: 'p1' }} />);
    const trigger = screen.getByRole('button', { name: /Wants to call delete_project/ });
    expect(trigger).toHaveTextContent('Needs approval');
    expect(within(trigger).queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByLabelText('Arguments')).toHaveTextContent('"id": "p1"');
    const group = screen.getByRole('group', { name: 'Allow this tool call?' });
    expect(within(group).getByRole('button', { name: 'Approve' })).toBeVisible();
    expect(within(group).getByRole('button', { name: 'Deny' })).toBeVisible();
    rerender(<ToolCallCard name="delete_project" status="awaiting-approval" args={{ id: 'p1' }} open={false} />);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(group).toBeVisible();
  });

  it('opens and announces once per approval entry without moving focus', async () => {
    const user = userEvent.setup();
    const view = (status: 'running' | 'awaiting-approval') => (
      <>
        <input aria-label="Composer" />
        <ToolCallCard name="delete_project" status={status} args={{ id: 'p1' }} />
      </>
    );
    const { rerender } = render(view('running'));
    const composer = screen.getByRole('textbox', { name: 'Composer' });
    composer.focus();
    rerender(view('awaiting-approval'));
    const announcement = screen.getByRole('status');
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    expect(announcement).toHaveTextContent('delete_project needs your approval');
    expect(screen.getAllByText('delete_project needs your approval')).toHaveLength(1);
    expect(composer).toHaveFocus();
    const trigger = screen.getByRole('button', { name: /Wants to call/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    rerender(view('awaiting-approval'));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('status')).toBe(announcement);
    rerender(view('running'));
    expect(screen.queryByText('delete_project needs your approval')).not.toBeInTheDocument();
    composer.focus();
    rerender(view('awaiting-approval'));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(composer).toHaveFocus();
    expect(screen.getAllByText('delete_project needs your approval')).toHaveLength(1);
  });

  it.each(['running', 'awaiting-approval'] as const)(
    'commits an empty live region before announcing approval from %s',
    (initialStatus) => {
      const commits: Array<{ region: HTMLElement | null; text: string | null }> = [];
      function ObservedCard({ status }: { status: 'running' | 'awaiting-approval' }) {
        // Observe the public DOM after commit, before passive effects can populate the region.
        useLayoutEffect(() => {
          const region = screen.queryByRole('status');
          commits.push({ region, text: region?.textContent ?? null });
        }, [status]);
        return <ToolCallCard name="delete_project" status={status} />;
      }

      const { rerender } = render(<ObservedCard status={initialStatus} />);
      if (initialStatus === 'running') {
        expect(commits.at(-1)?.region).toBeNull();
        rerender(<ObservedCard status="awaiting-approval" />);
      }
      const firstRegion = screen.getByRole('status');
      expect(commits.at(-1)?.region).toBe(firstRegion);
      expect(commits.at(-1)?.text).toBe('');
      expect(firstRegion).toHaveTextContent('delete_project needs your approval');

      rerender(<ObservedCard status="running" />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      rerender(<ObservedCard status="awaiting-approval" />);
      const nextRegion = screen.getByRole('status');
      expect(nextRegion).not.toBe(firstRegion);
      expect(commits.at(-1)?.region).toBe(nextRegion);
      expect(commits.at(-1)?.text).toBe('');
      expect(nextRegion).toHaveTextContent('delete_project needs your approval');
    },
  );
});
