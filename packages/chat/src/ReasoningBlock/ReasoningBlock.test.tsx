import { I18nProvider } from '@gntik-ai/ui';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatLayout } from '../ChatLayout';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import ReasoningBlockStreaming from './examples/ReasoningBlockStreaming';
import { ReasoningBlock } from './ReasoningBlock';

describe('ReasoningBlock', () => {
  it('opens while streaming, settles once on completion, and emits no automatic change', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ReasoningBlock streaming onOpenChange={onOpenChange}>
        Trace
      </ReasoningBlock>,
    );
    expect(screen.getByRole('button', { name: 'Thinking…' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Trace')).toBeVisible();
    rerender(<ReasoningBlock onOpenChange={onOpenChange}>Trace</ReasoningBlock>);
    expect(screen.getByRole('button', { name: 'Reasoning' })).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

it.each([undefined, '', '   ', null, false])('renders nothing for completed blank children (%s)', (children) => {
  const { container } = render(<ReasoningBlock>{children}</ReasoningBlock>);
  expect(container).toBeEmptyDOMElement();
});

it('shows only the streaming trigger before text arrives, with reduced-motion pulse and no live region', () => {
  const { container } = render(<ReasoningBlock streaming />);
  const trigger = screen.getByRole('button', { name: 'Thinking…' });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Thinking…')).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
  expect(container.querySelector('[aria-busy]')).toBeNull();
  expect(trigger).not.toHaveAttribute('aria-controls');
  expect(container.querySelector('[aria-live], [role="status"]')).toBeNull();
  expect(container.textContent).toBe('Thinking…');
});

it.each([
  [12000, 'Thought for 12 s'],
  [65000, 'Thought for 1 m 05 s'],
  [12600, 'Thought for 13 s'],
  [59900, 'Thought for 1 m 00 s'],
  [0, 'Thought for 0 s'],
  [undefined, 'Reasoning'],
] as const)('labels completed reasoning at %s ms', (durationMs, expected) => {
  render(<ReasoningBlock durationMs={durationMs}>Trace</ReasoningBlock>);
  expect(screen.getByRole('button', { name: expected })).toBeInTheDocument();
});

it('uses the Spanish catalog for streaming and completed labels', () => {
  const { rerender } = render(
    <I18nProvider locale="es">
      <ReasoningBlock streaming>Trace</ReasoningBlock>
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Pensando…' })).toBeInTheDocument();
  rerender(
    <I18nProvider locale="es">
      <ReasoningBlock durationMs={12000}>Trace</ReasoningBlock>
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Pensó durante 12 s' })).toHaveAttribute('aria-expanded', 'false');
  rerender(
    <I18nProvider locale="es">
      <ReasoningBlock>Trace</ReasoningBlock>
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Razonamiento' })).toBeInTheDocument();
});

it.each([true, false])('lets a custom label override the phase (streaming=%s)', (streaming) => {
  const { rerender } = render(
    <ReasoningBlock streaming={streaming} label={<strong>Details</strong>}>
      Trace
    </ReasoningBlock>,
  );
  expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
  rerender(
    <ReasoningBlock streaming={streaming} durationMs={12000} label="Details">
      Trace
    </ReasoningBlock>,
  );
  expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
});

it('renders safe streaming Markdown in a busy panel, including an unclosed fence', () => {
  const { container, rerender } = render(
    <ReasoningBlock streaming>{'[x](javascript:alert(1))\n\n```js\nconst n = 1;'}</ReasoningBlock>,
  );
  expect(screen.queryByRole('link')).toBeNull();
  expect(container.querySelector('pre code')).toHaveTextContent('const n = 1;');
  expect(container.querySelector('[aria-busy="true"]')).toHaveTextContent('const n = 1;');
  expect(container.querySelector('[data-streaming="true"]')).toBeInTheDocument();
  expect(container.querySelector('[aria-live], [role="status"]')).toBeNull();
  rerender(
    <ReasoningBlock open>
      <em>Custom trace</em>
    </ReasoningBlock>,
  );
  expect(screen.getByText('Custom trace').tagName).toBe('EM');
  expect(container.querySelector('[aria-busy="true"]')).toBeNull();
});

it.each([1, 2])('keeps the user choice after %s streaming toggles', async (toggles) => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const { rerender } = render(
    <ReasoningBlock streaming onOpenChange={onOpenChange}>
      Trace
    </ReasoningBlock>,
  );
  for (let i = 0; i < toggles; i++) await user.click(screen.getByRole('button', { name: 'Thinking…' }));
  const expected = toggles === 2 ? 'true' : 'false';
  expect(screen.getByRole('button', { name: 'Thinking…' })).toHaveAttribute('aria-expanded', expected);
  rerender(<ReasoningBlock onOpenChange={onOpenChange}>Trace</ReasoningBlock>);
  expect(screen.getByRole('button', { name: 'Reasoning' })).toHaveAttribute('aria-expanded', expected);
  expect(onOpenChange).toHaveBeenCalledTimes(toggles);
});

it.each([true, false])('always respects controlled open=%s; only user toggles notify', async (open) => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const { rerender } = render(
    <ReasoningBlock streaming open={open} onOpenChange={onOpenChange}>
      Trace
    </ReasoningBlock>,
  );
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', String(open));
  rerender(
    <ReasoningBlock open={open} durationMs={12000} onOpenChange={onOpenChange}>
      Trace
    </ReasoningBlock>,
  );
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', String(open));
  expect(onOpenChange).not.toHaveBeenCalled();
  rerender(
    <ReasoningBlock streaming open={open} onOpenChange={onOpenChange}>
      Trace
    </ReasoningBlock>,
  );
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', String(open));
  expect(onOpenChange).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button'));
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(!open);
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', String(open));
});

it('settles to defaultOpen once, allows later toggles, and resets user intent on a new stream', async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <ReasoningBlock streaming defaultOpen>
      Trace
    </ReasoningBlock>,
  );
  rerender(
    <ReasoningBlock defaultOpen durationMs={12000}>
      Trace
    </ReasoningBlock>,
  );
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  await user.click(screen.getByRole('button'));
  rerender(
    <ReasoningBlock defaultOpen durationMs={13000}>
      More trace
    </ReasoningBlock>,
  );
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  rerender(<ReasoningBlock streaming>Next trace</ReasoningBlock>);
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  await user.click(screen.getByRole('button'));
  await user.click(screen.getByRole('button'));
  rerender(<ReasoningBlock>Next trace</ReasoningBlock>);
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  rerender(<ReasoningBlock streaming>Third trace</ReasoningBlock>);
  rerender(<ReasoningBlock>Third trace</ReasoningBlock>);
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
});

it('Enter and Space toggle; Tab reaches a link in the open panel', async () => {
  const user = userEvent.setup();
  render(<ReasoningBlock>{'[Read more](/guide)'}</ReasoningBlock>);
  await user.tab();
  const trigger = screen.getByRole('button', { name: 'Reasoning' });
  expect(trigger).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await user.tab();
  expect(screen.getByRole('link', { name: 'Read more' })).toHaveFocus();
  await user.tab({ shift: true });
  await user.keyboard(' ');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

it('uses English fallbacks when the catalog returns missing keys', () => {
  const messages = {
    'chat.thinking': 'chat.thinking',
    'chat.thoughtFor': 'chat.thoughtFor',
    'chat.reasoning': 'chat.reasoning',
  };
  const { rerender } = render(
    <I18nProvider locale="es" messages={messages}>
      <ReasoningBlock streaming>Trace</ReasoningBlock>
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Thinking…' })).toBeInTheDocument();
  rerender(
    <I18nProvider locale="es" messages={messages}>
      <ReasoningBlock durationMs={12000}>Trace</ReasoningBlock>
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Thought for 12 s' })).toBeInTheDocument();
  rerender(
    <I18nProvider locale="es" messages={messages}>
      <ReasoningBlock>Trace</ReasoningBlock>
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Reasoning' })).toBeInTheDocument();
});

it('leaves an unpinned reader in place when reasoning collapses inside ChatLayout', async () => {
  const { rerender } = render(
    <ChatLayout>
      <ReasoningBlock streaming>Trace</ReasoningBlock>
      <p>Answer</p>
    </ChatLayout>,
  );
  const viewport = screen.getByRole('region', { name: 'Messages' });
  let height = 1200;
  // jsdom has no layout: provide the viewport measurements at the browser boundary.
  Object.defineProperties(viewport, {
    scrollHeight: { configurable: true, get: () => height },
    clientHeight: { configurable: true, value: 200 },
  });
  viewport.scrollTop = 1000;
  fireEvent.scroll(viewport);
  viewport.scrollTop = 120;
  fireEvent.scroll(viewport);
  expect(screen.getByRole('button', { name: 'Scroll to latest message' })).toBeInTheDocument();
  height = 900;
  await act(async () =>
    rerender(
      <ChatLayout>
        <ReasoningBlock>Trace</ReasoningBlock>
        <p>Answer</p>
      </ChatLayout>,
    ),
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Reasoning' })).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(viewport.scrollTop).toBe(120);
});

it.each(['dark', 'light', 'high_contrast'])(
  'the live example has no axe violations in %s, across all phases',
  async (theme) => {
    document.documentElement.className = theme;
    const user = userEvent.setup();
    const { container } = render(<ReasoningBlockStreaming />);
    expect(screen.getByRole('status')).toHaveTextContent('Assistant is thinking…');
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('status')).toHaveTextContent('Assistant is responding…');
    expect(screen.getByRole('button', { name: 'Thought for 12 s' })).toHaveAttribute('aria-expanded', 'false');
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.getByRole('status')).toHaveTextContent('The deployment succeeded.');
    await expectNoAxeViolations(container);
  },
);

it('has no axe violations before the first reasoning token arrives', async () => {
  const { container } = render(<ReasoningBlock streaming />);
  await expectNoAxeViolations(container);
});
