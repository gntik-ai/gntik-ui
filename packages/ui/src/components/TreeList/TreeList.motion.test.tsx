import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TreeList } from './TreeList';

afterEach(() => vi.restoreAllMocks());

const nodes = [{ id: 'folder', label: 'Folder', children: [{ id: 'child', label: 'Child' }] }];

it('uses Base UI panel states and keeps closing children mounted and inert until height transition ends', async () => {
  const original = window.getComputedStyle;
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
    const style = original(el, pseudo);
    if (el.getAttribute('role') === 'group') {
      Object.defineProperties(style, {
        transitionDuration: { value: '0.2s' },
        transitionProperty: { value: 'height' },
      });
    }
    return style;
  });
  const { rerender } = render(<TreeList nodes={nodes} expanded={[]} />);
  rerender(<TreeList nodes={nodes} expanded={['folder']} />);
  const group = screen.getByRole('group');
  expect(group).toHaveAttribute('data-starting-style');
  expect(group).toHaveClass('transition-[height]', 'duration-(--duration-normal)', 'ease-(--ease-standard)');
  await waitFor(() => expect(group).not.toHaveAttribute('data-starting-style'));
  fireEvent.transitionEnd(group, { propertyName: 'height' });
  rerender(<TreeList nodes={nodes} expanded={[]} />);
  await waitFor(() => expect(group).toHaveAttribute('data-ending-style'));
  expect(group).toHaveClass('transition-[height]', 'motion-reduce:transition-none');
  expect(group).toHaveAttribute('inert');
  expect(group).toHaveAttribute('aria-hidden', 'true');
  expect(group.querySelector('[data-id="child"]')).toHaveAttribute('tabindex', '-1');
  fireEvent.transitionEnd(group, { propertyName: 'height' });
  await waitFor(() => expect(group).not.toBeInTheDocument());
  vi.restoreAllMocks();
});

it('removes a closed group immediately when the reduced-motion token resolves to zero', async () => {
  const original = window.getComputedStyle;
  const media = vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
    const style = original(el, pseudo);
    if (el.getAttribute('role') === 'group') Object.defineProperty(style, 'transitionDuration', { value: '0s' });
    return style;
  });
  const { rerender } = render(<TreeList nodes={nodes} expanded={['folder']} />);
  expect(screen.getByRole('group')).toBeInTheDocument();
  rerender(<TreeList nodes={nodes} expanded={[]} />);
  await waitFor(() => expect(screen.queryByRole('group', { hidden: true })).toBeNull());
  media.mockRestore();
  vi.restoreAllMocks();
});

it('keeps the measured height until an opening transition actually finishes', async () => {
  const original = window.getComputedStyle;
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
    const style = original(el, pseudo);
    if (el.getAttribute('role') === 'group') Object.defineProperty(style, 'transitionDuration', { value: '0.2s' });
    return style;
  });
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(240);
  let finish: (animation: Animation) => void = () => {};
  const animation = {
    finished: new Promise<Animation>((resolve) => {
      finish = resolve;
    }),
  } as Animation;
  vi.spyOn(Element.prototype, 'getAnimations').mockReturnValue([animation]);
  const { rerender } = render(<TreeList nodes={nodes} expanded={[]} />);
  rerender(<TreeList nodes={nodes} expanded={['folder']} />);
  const group = screen.getByRole('group');
  await waitFor(() => expect(group).not.toHaveAttribute('data-starting-style'));
  expect(group.style.getPropertyValue('--collapsible-panel-height')).toBe('240px');
  await act(async () => finish(animation));
  await waitFor(() => expect(group.style.getPropertyValue('--collapsible-panel-height')).toBe(''));
  expect(group).toHaveAttribute('class', 'm-0 list-none p-0');
});
