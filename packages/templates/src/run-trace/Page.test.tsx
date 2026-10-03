import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import RunTracePage from './Page';

// Dock the inspector as on a large screen (jsdom matches no media query).
const originalMatchMedia = window.matchMedia;
beforeAll(() => {
  window.matchMedia = (query: string) => ({ ...originalMatchMedia(query), matches: query.includes('min-width') }) as MediaQueryList;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

describe('RunTracePage', () => {
  it('renders the run header, waterfall, cost, log and the span inspector', { timeout: 15000 }, async () => {
    render(<RunTracePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Answer support question' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Spans' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Tokens and cost' })).toBeInTheDocument();
    const panel = screen.getByRole('complementary', { name: 'Span inspector' });
    // The first running child span is selected: live timer, input JSON, no output yet.
    expect(within(panel).getByText('generate answer')).toBeInTheDocument();
    expect(within(panel).getByRole('timer', { name: 'generate answer elapsed time' })).toBeInTheDocument();
    expect(within(panel).getByRole('tree', { name: 'generate answer input' })).toBeInTheDocument();
    expect(within(panel).getByText('Waiting for the span to finish…')).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('selecting a span shows its input and output', { timeout: 15000 }, async () => {
    const onSelectSpan = vi.fn();
    render(<RunTracePage onSelectSpan={onSelectSpan} />);
    await userEvent.click(screen.getByRole('button', { name: /lookup_order \(retry\)/ }));
    expect(onSelectSpan).toHaveBeenCalledWith(expect.objectContaining({ id: 'lookup-retry' }));
    const panel = screen.getByRole('complementary', { name: 'Span inspector' });
    expect(within(panel).getByRole('tree', { name: 'tool: lookup_order (retry) output' })).toHaveTextContent('shipped');
    expect(within(panel).queryByRole('timer')).toBeNull();
  });

  it('closes the inspector and shows actions only when handlers are given', { timeout: 15000 }, async () => {
    const onRerun = vi.fn();
    render(<RunTracePage onRerun={onRerun} run={{ id: 'run_1', name: 'Nightly eval', status: 'succeeded', model: 'm', environment: 'staging' }} />);
    expect(screen.queryByRole('button', { name: 'Cancel run' })).toBeNull();
    await userEvent.click(screen.getAllByRole('button', { name: 'Re-run' })[0]!);
    expect(onRerun).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Toggle span inspector' }));
    expect(screen.queryByRole('complementary', { name: 'Span inspector' })).toBeNull();
  });
});
