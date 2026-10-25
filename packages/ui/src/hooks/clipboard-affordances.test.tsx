import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { CodeBlock } from '../components/CodeBlock';
import { JsonViewer } from '../components/JsonViewer';
import { Terminal } from '../components/Terminal';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  ['CodeBlock', () => <CodeBlock code="abc" />, 'Copy'],
  ['JsonViewer', () => <JsonViewer data="abcdef" maxDisplayChars={4} />, 'Copy value'],
  ['Terminal', () => <Terminal lines={['abc']} />, 'Copy all'],
] as const)('%s copies with the legacy path and does not confirm a failed copy', async (_, view, label) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  const exec = vi.fn(() => true);
  Object.defineProperty(document, 'execCommand', { configurable: true, value: exec });
  const { unmount } = render(view());
  await act(async () => fireEvent.click(screen.getByRole('button', { name: label })));
  expect(exec).toHaveBeenCalledWith('copy');
  expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
  unmount();
  exec.mockReturnValue(false);
  render(view());
  await act(async () => fireEvent.click(screen.getByRole('button', { name: label })));
  expect(screen.getByRole('status')).toHaveTextContent('Copy failed');
});
