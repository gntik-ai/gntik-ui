import { act } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { mockMediaQueries } from '../../test/media-query';
import { Carousel } from './Carousel';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const gallery = (
  <Carousel label="Gallery" autoplay={5000}>
    <div>One</div>
    <div>Two</div>
  </Carousel>
);

it('pauses autoplay for reduced motion and uses automatic scrolling', () => {
  mockMediaQueries(1280, true);
  render(gallery);
  expect(screen.getByRole('button', { name: 'Start automatic slide show' })).toBeInTheDocument();
  const strip = screen.getByRole('group', { name: 'Gallery' });
  const scrollBy = vi.fn();
  strip.scrollBy = scrollBy;
  fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
  expect(scrollBy).toHaveBeenCalledWith({ left: 0, behavior: 'auto' });
});

it('hydrates without mismatches and pauses once the reduced-motion preference is available', async () => {
  vi.stubGlobal('matchMedia', undefined);
  const container = document.createElement('div');
  container.innerHTML = renderToString(gallery);
  mockMediaQueries(1280, true);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const recoverable = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, gallery, { onRecoverableError: recoverable });
    });
    expect(within(container).getByRole('button', { name: 'Start automatic slide show' })).toHaveAttribute(
      'type',
      'button',
    );
    expect(error).not.toHaveBeenCalled();
    expect(recoverable).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    error.mockRestore();
  }
});

it('keeps autoplay stopped under an in-app motion scope', () => {
  mockMediaQueries();
  document.documentElement.dataset.motion = 'reduce';
  try {
    render(gallery);
    expect(screen.getByRole('button', { name: 'Start automatic slide show' })).toBeInTheDocument();
  } finally {
    document.documentElement.removeAttribute('data-motion');
  }
});
