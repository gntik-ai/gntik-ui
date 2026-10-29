import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { SidebarLayout } from './SidebarLayout';

it('hydrates the default before restoring a persisted collapsed rail without a mismatch', async () => {
  const container = document.createElement('div');
  const layout = <SidebarLayout storageKey="sidebar:hydration" sidebar="Navigation" />;
  container.innerHTML = renderToString(layout);
  expect(container.querySelector('aside')).toHaveAttribute('data-state', 'expanded');
  localStorage.setItem('sidebar:hydration', 'true');
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const recoverable = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, layout, { onRecoverableError: recoverable });
    });
    expect(error).not.toHaveBeenCalled();
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.querySelector('aside')).toHaveAttribute('data-state', 'rail');
  } finally {
    await act(async () => root?.unmount());
    error.mockRestore();
  }
});
