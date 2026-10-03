import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { LogViewer } from './LogViewer';
import { makeLogLines } from './fixtures';

const renderedLines = () => document.querySelectorAll('[data-slot="log-line"]');

describe('LogViewer', () => {
  it('renders only a window of rows, pinned to the tail while following', async () => {
    render(<LogViewer />);
    const log = screen.getByRole('log', { name: 'Logs' });
    expect(log).toBeInTheDocument();
    expect(renderedLines().length).toBeLessThan(40);
    expect(within(log).getByText('12:02:57.230')).toBeInTheDocument(); // last line (index 479)
    await expectNoAxeViolations();
  });

  it('scrolling moves the window and turns follow off', () => {
    render(<LogViewer lines={makeLogLines(1000)} defaultFollow={false} height={240} rowHeight={24} overscan={2} />);
    const log = screen.getByRole('log');
    expect(screen.getByRole('switch', { name: 'Follow' })).not.toBeChecked();
    expect(within(log).getByText('12:00:00.000')).toBeInTheDocument();
    log.scrollTop = 24 * 500;
    fireEvent.scroll(log);
    expect(within(log).queryByText('12:00:00.000')).not.toBeInTheDocument();
    expect(renderedLines()).toHaveLength(14);
  });

  it('filters by level, highlights search matches and copies a line', async () => {
    const user = userEvent.setup();
    const onCopyLine = vi.fn();
    render(<LogViewer lines={makeLogLines(20)} onCopyLine={onCopyLine} />);
    await user.click(screen.getByRole('button', { name: /^debug/ }));
    expect(screen.getByText('16 of 20')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Search logs' }), 'failed');
    expect(screen.getByText('2 of 20')).toBeInTheDocument();
    expect(document.querySelectorAll('mark')).toHaveLength(2);
    await user.click(screen.getAllByRole('button', { name: /^Copy line/ })[0]!);
    expect(onCopyLine).toHaveBeenCalledWith(expect.objectContaining({ level: 'error' }));
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});
