import { I18nProvider } from '@gntik-ai/ui';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DescriptionListCard } from '../data-display/DescriptionListCard/DescriptionListCard';
import { LogViewer } from '../builders/LogViewer/LogViewer';

const item = { id: 'request', label: 'Request ID', value: 'req_123', copyable: true };
const line = { id: 'request', timestamp: '12:00:00.000', level: 'info' as const, message: 'Request received' };
const cases = [
  {
    name: 'DescriptionListCard',
    idle: 'Copy Request ID',
    copied: 'Request ID copied',
    value: 'req_123',
    callbackValue: item,
    view: (onCopy: () => void, labels?: { copyFailed?: string }) => (
      <DescriptionListCard items={[item]} onCopy={onCopy} labels={labels} />
    ),
  },
  {
    name: 'LogViewer',
    idle: 'Copy line 12:00:00.000',
    copied: 'Copied',
    value: '12:00:00.000 INFO Request received',
    callbackValue: line,
    view: (onCopy: () => void, labels?: { copyFailed?: string }) => (
      <LogViewer lines={[line]} onCopyLine={onCopy} labels={labels} />
    ),
  },
];
let clipboardDescriptor: PropertyDescriptor | undefined;
beforeEach(() => {
  vi.useFakeTimers();
  clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
});
afterEach(() => {
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else Reflect.deleteProperty(navigator, 'clipboard');
  vi.useRealTimers();
});
const setClipboard = (value: unknown) => Object.defineProperty(navigator, 'clipboard', { configurable: true, value });

describe.each(cases)('$name clipboard lifecycle', ({ name, idle, copied, value, callbackValue, view }) => {
  it.each(['resolved', 'rejected', 'missing-writeText'] as const)(
    'resets a %s result after 1500ms',
    async (outcome) => {
      const writeText =
        outcome === 'resolved'
          ? vi.fn().mockResolvedValue(undefined)
          : vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
      setClipboard(outcome === 'missing-writeText' ? {} : { writeText });
      const onCopy = vi.fn();
      const { container } = render(view(onCopy));
      await act(async () => fireEvent.click(screen.getByRole('button', { name: idle })));
      const resultLabel = outcome === 'resolved' ? copied : 'Copy failed';
      expect(screen.getByRole('button', { name: resultLabel })).toBeInTheDocument();
      if (outcome === 'resolved') {
        expect(writeText).toHaveBeenCalledWith(value);
        expect(onCopy).toHaveBeenCalledExactlyOnceWith(callbackValue);
      } else expect(onCopy).not.toHaveBeenCalled();
      if (name === 'DescriptionListCard') {
        expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
          outcome === 'resolved' ? 'Copied to clipboard' : 'Copy failed',
        );
      }
      act(() => vi.advanceTimersByTime(1499));
      expect(screen.getByRole('button', { name: resultLabel })).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByRole('button', { name: idle })).toBeInTheDocument();
    },
  );

  it.each(['resolved', 'rejected'] as const)(
    'waits for the write to be %s before reporting the result',
    async (outcome) => {
      let finish!: () => void;
      let deny!: (error: Error) => void;
      setClipboard({
        writeText: () =>
          new Promise<void>((resolve, reject) => {
            finish = resolve;
            deny = reject;
          }),
      });
      const onCopy = vi.fn();
      render(view(onCopy));
      fireEvent.click(screen.getByRole('button', { name: idle }));
      expect(screen.getByRole('button', { name: idle })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: copied })).toBeNull();
      expect(onCopy).not.toHaveBeenCalled();
      await act(async () => {
        if (outcome === 'resolved') finish();
        else deny(new DOMException('Denied', 'NotAllowedError'));
      });
      expect(screen.getByRole('button', { name: outcome === 'resolved' ? copied : 'Copy failed' })).toBeInTheDocument();
      expect(onCopy).toHaveBeenCalledTimes(outcome === 'resolved' ? 1 : 0);
    },
  );

  it('clears the old reset as soon as a new write starts', async () => {
    let finish!: () => void;
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new DOMException('Denied', 'NotAllowedError'))
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
    setClipboard({ writeText });
    const onCopy = vi.fn();
    const { unmount } = render(view(onCopy));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: idle })));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole('button', { name: 'Copy failed' }));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
    await act(async () => finish());
    expect(screen.getByRole('button', { name: copied })).toBeInTheDocument();
    expect(onCopy).toHaveBeenCalledExactlyOnceWith(callbackValue);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['resolved', 'rejected'] as const)(
    'does not schedule a reset after a pending write is %s on unmount',
    async (outcome) => {
      let finish!: () => void;
      let deny!: (error: Error) => void;
      setClipboard({
        writeText: () =>
          new Promise<void>((resolve, reject) => {
            finish = resolve;
            deny = reject;
          }),
      });
      const { unmount } = render(view(vi.fn()));
      fireEvent.click(screen.getByRole('button', { name: idle }));
      unmount();
      await act(async () => {
        if (outcome === 'resolved') finish();
        else deny(new DOMException('Denied', 'NotAllowedError'));
      });
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it.each([
    ['en', undefined, 'Copy failed'],
    ['es', undefined, 'No se pudo copiar'],
    ['es', 'Custom failure', 'Custom failure'],
  ] as const)(
    'uses the %s catalog with override %s for the failure name and announcement',
    async (locale, override, expected) => {
      setClipboard({ writeText: vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError')) });
      const { container } = render(
        <I18nProvider locale={locale}>{view(vi.fn(), { copyFailed: override })}</I18nProvider>,
      );
      await act(async () => fireEvent.click(screen.getByRole('button', { name: /^(Copy |Copiar )/ })));
      expect(screen.getByRole('button', { name: expected })).toBeInTheDocument();
      if (name === 'DescriptionListCard')
        expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(expected);
    },
  );
});
