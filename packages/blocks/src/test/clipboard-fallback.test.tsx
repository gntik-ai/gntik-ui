import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DescriptionListCard } from '../data-display/DescriptionListCard/DescriptionListCard';
import { LogViewer } from '../builders/LogViewer/LogViewer';
import { ErrorPanel } from '../feedback/ErrorPanel/ErrorPanel';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  [
    'DescriptionListCard',
    () => <DescriptionListCard items={[{ id: 'id', label: 'ID', value: 'req_123', copyable: true }]} />,
    'Copy ID',
    'ID copied',
    'req_123',
  ],
  [
    'LogViewer',
    () => <LogViewer lines={[{ id: 'id', timestamp: '12:00', level: 'info', message: 'Hello' }]} />,
    'Copy line 12:00',
    'Copied',
    '12:00 INFO Hello',
  ],
  ['ErrorPanel', () => <ErrorPanel requestId="req_123" />, 'Copy request ID', 'Copied', 'req_123'],
] as const)('%s confirms only successful fallback writes', async (_, view, idle, copied, value) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  const exec = vi.fn(() => {
    expect(document.querySelector('textarea')?.value).toBe(value);
    return true;
  });
  Object.defineProperty(document, 'execCommand', { configurable: true, value: exec });
  const { unmount } = render(view());
  await act(async () => fireEvent.click(screen.getByRole('button', { name: idle })));
  expect(exec).toHaveBeenCalledWith('copy');
  expect(screen.getByRole('button', { name: copied })).toBeInTheDocument();
  unmount();
  exec.mockReturnValue(false);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
  });
  render(view());
  await act(async () => fireEvent.click(screen.getByRole('button', { name: idle })));
  expect(screen.queryByRole('button', { name: copied })).not.toBeInTheDocument();
  expect(screen.queryByText('Copied to clipboard')).not.toBeInTheDocument();
});
