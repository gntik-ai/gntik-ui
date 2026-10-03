import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import NoDetails from './examples/no-details';
import RunningTrace from './examples/running';
import { TraceWaterfall, formatSpanDuration } from './TraceWaterfall';

const spanList = () => screen.getByRole('list', { name: 'Spans' });

describe('TraceWaterfall', () => {
  it('renders the span tree with bars positioned on the time axis', async () => {
    render(<TraceWaterfall />);
    expect(within(spanList()).getAllByRole('listitem')).toHaveLength(8);
    expect(screen.getByText('8 spans · 2.45s')).toBeInTheDocument();
    expect(screen.getByText('1 error')).toBeInTheDocument();
    const details = screen.getByRole('complementary', { name: 'Span details' });
    expect(within(details).getByRole('heading', { name: 'POST /v1/answer' })).toBeInTheDocument();
    const bar = screen.getByRole('button', { name: /^generate answer/ }).querySelector('[style*="width"]') as HTMLElement;
    expect(bar.style.insetInlineStart).toBe(`${(440 / 2450) * 100}%`);
    await expectNoAxeViolations();
  });

  it('collapses and expands spans, and selects a span to show its details', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TraceWaterfall onSelect={onSelect} />);
    const collapse = screen.getByRole('button', { name: 'Collapse retrieve context' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await user.click(collapse);
    expect(within(spanList()).getAllByRole('listitem')).toHaveLength(6);
    expect(screen.queryByRole('button', { name: /^embed query/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Expand retrieve context' }));
    expect(within(spanList()).getAllByRole('listitem')).toHaveLength(8);

    const span = screen.getByRole('button', { name: 'tool: lookup_order, 150ms, error' });
    await user.click(span);
    expect(span).toHaveAttribute('aria-pressed', 'true');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 's6' }));
    const details = screen.getByRole('complementary', { name: 'Span details' });
    expect(within(details).getByText('timeout after 150ms')).toBeInTheDocument();
  });

  it('formats durations', () => {
    expect(formatSpanDuration(412)).toBe('412ms');
    expect(formatSpanDuration(2450)).toBe('2.45s');
    expect(formatSpanDuration(12_500)).toBe('12.5s');
  });

  it('moves through spans with the arrow keys and selects with Enter (one tab stop)', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TraceWaterfall onSelect={onSelect} />);
    await user.tab();
    const root = screen.getByRole('button', { name: 'POST /v1/answer, 2.45s' });
    expect(root).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: /^retrieve context,/ })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Expand retrieve context' })).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Collapse retrieve context' })).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /^embed query,/ })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: /^retrieve context,/ })).toHaveFocus();
    await user.keyboard('{End}');
    const last = screen.getByRole('button', { name: /^format response,/ });
    expect(last).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(last).toHaveAttribute('aria-pressed', 'true');
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: 's8' }));
    await user.keyboard('{Home}');
    expect(root).toHaveFocus();
    // Only one span button is in the tab order.
    expect(within(spanList()).getAllByRole('button').filter((b) => b.tabIndex === 0)).toHaveLength(1);
  });

  it('supports controlled selection and running spans (not colour-only)', async () => {
    const user = userEvent.setup();
    render(<RunningTrace />);
    expect(screen.getByText('2 running')).toBeInTheDocument();
    const generating = screen.getByRole('button', { name: 'generate answer, 1.39s, running' });
    expect(generating).toHaveAttribute('aria-pressed', 'true');
    expect(generating).toHaveTextContent('running');
    expect(generating.querySelector('[data-span-bar]')).toHaveClass('motion-reduce:animate-none');
    const details = screen.getByRole('complementary', { name: 'Span details' });
    expect(within(details).getByText('Running')).toBeInTheDocument();
    expect(within(details).getByText('Elapsed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^tool: search_docs/ }));
    expect(within(details).getByRole('heading', { name: 'tool: search_docs' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('ignores clicks in controlled mode until the parent updates selectedId', async () => {
    const user = userEvent.setup();
    const onSelectedIdChange = vi.fn();
    render(<TraceWaterfall selectedId="s2" onSelectedIdChange={onSelectedIdChange} />);
    await user.click(screen.getByRole('button', { name: /^format response,/ }));
    expect(onSelectedIdChange).toHaveBeenCalledWith('s8');
    expect(screen.getByRole('button', { name: /^retrieve context,/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides the details pane or renders custom details', async () => {
    const { unmount } = render(<NoDetails />);
    expect(screen.queryByRole('complementary')).toBeNull();
    await expectNoAxeViolations();
    unmount();
    render(<TraceWaterfall renderDetails={(span) => <p>Custom {span.id}</p>} />);
    expect(within(screen.getByRole('complementary', { name: 'Span details' })).getByText('Custom s1')).toBeInTheDocument();
  });
});
