import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import ToolCallCardStates from './examples/ToolCallCardStates';
import { ToolCallCard } from './ToolCallCard';

describe('ToolCallCard', () => {
  it('shows name, status and duration in its toggle', () => {
    render(<ToolCallCard name="search_invoices" status="succeeded" durationMs={840} args={{ a: 1 }} result={{ ok: true }} />);
    const toggle = screen.getByRole('button', { name: /search_invoices/ });
    expect(toggle).toHaveTextContent('Called');
    expect(toggle).toHaveTextContent('Succeeded');
    expect(toggle).toHaveTextContent('840 ms');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('Enter and Space expand and collapse; arguments and result render as JSON', async () => {
    const user = userEvent.setup();
    render(<ToolCallCard name="list_deployments" status="succeeded" durationMs={2400} args={{ project: 'web-app' }} result={{ count: 3 }} />);
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
