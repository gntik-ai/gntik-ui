import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { ChatDemo } from './ChatDemo';
import { DEMO_REPLY, DEMO_TOOL, chunk } from './demoScript';

const total = DEMO_TOOL.durationMs + (chunk(DEMO_REPLY).length + 2) * 30;

describe('ChatDemo', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('streams a reply after a suggestion, then shows actions and sources', () => {
    render(<ChatDemo />);
    fireEvent.click(screen.getByRole('button', { name: /Summarise deployments/ }));
    expect(screen.getByRole('article', { name: 'You' })).toHaveTextContent('Summarise deployments');
    expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Running');
    expect(screen.getByRole('button', { name: 'Stop generating' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Assistant is responding…');
    act(() => vi.advanceTimersByTime(total));
    expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Succeeded');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeInTheDocument();
    // The thread announcer is the last status region (each reply's feedback has its own).
    expect(screen.getAllByRole('status').at(-1)).toHaveTextContent('Here is the summary');
    expect(screen.getByRole('group', { name: 'Response feedback' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeInTheDocument();
    expect(screen.getAllByRole('region', { name: 'Sources' }).length).toBeGreaterThan(0);
  });

  it('sends attachments with the message and rates the reply', () => {
    const { container } = render(<ChatDemo />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a,b'], 'data.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('list', { name: 'Attachments' })).toHaveTextContent('data.csv');
    expect(screen.getByRole('combobox', { name: 'Model' })).toHaveTextContent('Balanced');
    const box = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(box, { target: { value: 'Summarise this file' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    const userTurn = screen.getByRole('article', { name: 'You' });
    expect(userTurn).toHaveTextContent('Summarise this file');
    expect(userTurn).toHaveTextContent('data.csv');
    act(() => vi.advanceTimersByTime(total));
    const good = screen.getByRole('button', { name: 'Good response' });
    fireEvent.click(good);
    expect(good).toHaveAttribute('aria-pressed', 'true');
  });

  it('Escape in the composer stops the stream and clears the timers', () => {
    render(<ChatDemo />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(box, { target: { value: 'How are deployments going?' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    act(() => vi.advanceTimersByTime(DEMO_TOOL.durationMs + 90));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    fireEvent.keyDown(box, { key: 'Escape' });
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('unmounting mid-stream clears every timer', () => {
    const { unmount } = render(<ChatDemo />);
    fireEvent.click(screen.getByRole('button', { name: /Find unpaid invoices/ }));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('has no axe violations (empty and answered)', async () => {
    const { container } = render(<ChatDemo />);
    vi.useRealTimers();
    await expectNoAxeViolations(container);
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: /Summarise deployments/ }));
    act(() => vi.advanceTimersByTime(total));
    vi.useRealTimers();
    await expectNoAxeViolations(container);
  });
});
