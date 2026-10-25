import { act, renderHook } from '@testing-library/react';
import { useChatScroll } from './useChatScroll';

it('scrolls to the latest message without smooth motion under the app scope', () => {
  document.documentElement.dataset.motion = 'reduce';
  const { result } = renderHook(() => useChatScroll());
  const viewport = document.createElement('div');
  const scroll = vi.fn();
  viewport.scrollTo = scroll;
  try {
    act(() => result.current.scrollRef(viewport));
    act(() => result.current.scrollToBottom());
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  } finally {
    document.documentElement.removeAttribute('data-motion');
  }
});
