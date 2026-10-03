import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
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
});
