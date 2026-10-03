import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { LiveAnnouncer } from '../LiveAnnouncer';
import { CopyButton } from './CopyButton';
import { copyToClipboard } from './clipboard';
import CopyButtonBasic from './examples/CopyButtonBasic';
import CopyButtonGetter from './examples/CopyButtonGetter';

function mockClipboard(impl: (text: string) => Promise<void> = () => Promise.resolve()) {
  const writeText = vi.fn(impl);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

function removeClipboard() {
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
}

describe('CopyButton', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([['Enter', '{Enter}'], ['Space', ' ']])('%s copies the value and announces it politely', async (_, key) => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    const onCopy = vi.fn();
    render(<CopyButton value="ws_8f2a" label="Copy ID" onCopy={onCopy} />);
    await user.tab();
    const button = screen.getByRole('button', { name: 'Copy ID' });
    expect(button).toHaveFocus();
    await user.keyboard(key);
    expect(writeText).toHaveBeenCalledWith('ws_8f2a');
    expect(await screen.findByRole('button', { name: 'Copied' })).toHaveClass('text-primary-text');
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
    expect(onCopy).toHaveBeenCalledWith('ws_8f2a');
  });

  it('Tab moves focus to and from the button', async () => {
    const user = userEvent.setup();
    render(
      <>
        <CopyButton value="a" display="label" />
        <button type="button">After</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('calls an async getter and resets after two seconds', async () => {
    vi.useFakeTimers();
    const writeText = mockClipboard();
    render(<CopyButton value={async () => 'lazy'} display="label" />);
    await act(async () => screen.getByRole('button', { name: 'Copy' }).click());
    expect(writeText).toHaveBeenCalledWith('lazy');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('uses the LiveAnnouncer above it instead of its own region', async () => {
    const user = userEvent.setup();
    mockClipboard();
    const { container } = render(
      <LiveAnnouncer>
        <CopyButton value="x" display="label" announcement="Token copied" />
      </LiveAnnouncer>,
    );
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(container.querySelector('[data-live-announcer="polite"]')).toHaveTextContent('Token copied'));
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('falls back to execCommand when the Clipboard API is missing', async () => {
    const user = userEvent.setup();
    removeClipboard();
    const exec = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { value: exec, configurable: true });
    render(<CopyButton value="fallback" display="label" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(exec).toHaveBeenCalledWith('copy');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('announces a failure when every path fails', async () => {
    const user = userEvent.setup();
    mockClipboard(() => Promise.reject(new Error('denied')));
    Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true });
    const onCopyError = vi.fn();
    render(<CopyButton value="x" display="label" onCopyError={onCopyError} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copy failed'));
    expect(screen.getByRole('button', { name: 'Copy failed' })).toHaveClass('text-destructive-text');
    expect(onCopyError).toHaveBeenCalled();
    await expect(copyToClipboard('y')).rejects.toThrow('denied');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <CopyButtonBasic />
        <CopyButtonGetter />
      </>,
    );
    await expectNoAxeViolations();
  });
});
