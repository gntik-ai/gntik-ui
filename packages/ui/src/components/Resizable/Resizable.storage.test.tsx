import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { ResizablePanel, ResizablePanelGroup, ResizeHandle } from './Resizable';

function Editor() {
  return (
    <ResizablePanelGroup autoSaveId="editor">
      <ResizablePanel id="editor-left" defaultSize={30}>
        Editor
      </ResizablePanel>
      <ResizeHandle step={0.12345} />
      <ResizablePanel id="editor-right">Preview</ResizablePanel>
    </ResizablePanelGroup>
  );
}

it('hydrates defaults without reading storage on the server, then restores the released format', async () => {
  localStorage.setItem('gntik-ui:resizable:editor', '[40,60]');
  const get = vi.spyOn(Storage.prototype, 'getItem');
  const container = document.createElement('div');
  let root: ReturnType<typeof hydrateRoot> | undefined;
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const recoverable = vi.fn();
  try {
    container.innerHTML = renderToString(<Editor />);
    expect(get).not.toHaveBeenCalled();
    expect(container.querySelector('[role="separator"]')).toHaveAttribute('aria-valuenow', '30');
    await act(async () => {
      root = hydrateRoot(container, <Editor />, { onRecoverableError: recoverable });
    });
    expect(container.querySelector('#editor-left')).toHaveStyle({ flexGrow: '40' });
    expect(container.querySelector('#editor-right')).toHaveStyle({ flexGrow: '60' });
    expect(error).not.toHaveBeenCalled();
    expect(recoverable).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    get.mockRestore();
    error.mockRestore();
  }
});

it.each(['[20,30,50]', '[-10,110]', '[20,30]', '[1e999,0]', '{', '["40",60]'])(
  'ignores invalid or mismatched sizes without overwriting %s',
  (raw) => {
    localStorage.setItem('gntik-ui:resizable:editor', raw);
    render(<Editor />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '30');
    expect(localStorage.getItem('gntik-ui:resizable:editor')).toBe(raw);
  },
);

it('restores sizes on a client mount and persists the current two-decimal array format', () => {
  localStorage.setItem('gntik-ui:resizable:editor', '[40,60]');
  render(<Editor />);
  expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '40');
  fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });
  expect(localStorage.getItem('gntik-ui:resizable:editor')).toBe('[40.12,59.88]');
});
