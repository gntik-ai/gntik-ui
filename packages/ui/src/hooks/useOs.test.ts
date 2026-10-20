import { act, createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { CommandPalette, CommandPaletteTrigger } from '../components/CommandPalette/CommandPalette';
import { getOs, useOs } from './useOs';

afterEach(() => vi.unstubAllGlobals());

describe('operating system detection', () => {
  it.each([
    [{ platform: 'MacIntel' }, 'macos'],
    [{ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' }, 'ios'],
    [{ platform: 'MacIntel', maxTouchPoints: 5 }, 'ios'],
    [{ platform: 'Win32' }, 'windows'],
    [{ platform: 'Linux armv8l', userAgent: 'Mozilla/5.0 (Linux; Android 15)' }, 'android'],
    [{ platform: 'Linux x86_64', userAgent: 'Mozilla/5.0 (X11; CrOS x86_64)' }, 'chromeos'],
    [{ platform: 'Linux x86_64' }, 'linux'],
    [{ userAgentData: { platform: 'Windows' }, platform: 'MacIntel', userAgent: 'Android' }, 'windows'],
    [{ userAgentData: { platform: 'macOS' }, platform: 'Win32' }, 'macos'],
    [{ userAgentData: { platform: 'Linux' }, platform: 'Win32', userAgent: 'Android' }, 'linux'],
    [{ platform: 'Linux x86_64', userAgent: 'Windows NT 10.0' }, 'linux'],
    [{ platform: 'MacIntel', maxTouchPoints: 1 }, 'macos'],
    [{ platform: '', userAgent: 'Windows NT 10.0' }, 'windows'],
    [{ platform: 'unknown', userAgent: '' }, 'undetermined'],
    [undefined, 'undetermined'],
  ])('detects %j as %s', (navigatorValue, expected) => {
    vi.stubGlobal('navigator', navigatorValue);
    expect(getOs()).toBe(expected);
  });

  it('reports the OS on the first client render', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    function Platform() {
      return createElement('span', null, useOs());
    }
    render(createElement(Platform));
    expect(screen.getByText('macos')).toBeInTheDocument();
  });

  it('server-renders Ctrl without accessing navigator and hydrates to Command without mismatches', async () => {
    vi.stubGlobal('navigator', undefined);
    const navigatorRead = vi.fn(() => {
      throw new Error('navigator accessed during SSR');
    });
    Object.defineProperty(globalThis, 'navigator', { configurable: true, get: navigatorRead });
    const element = createElement(CommandPalette, { groups: [] }, createElement(CommandPaletteTrigger));
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    expect(navigatorRead).not.toHaveBeenCalled();
    expect(within(container).getByText('Ctrl')).toHaveAttribute('aria-hidden', 'true');
    expect(within(container).getByText('Control')).toHaveClass('sr-only');
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError: recoverable });
      });
      expect(within(container).getByText('⌘')).toHaveAttribute('aria-hidden', 'true');
      expect(within(container).getByText('Command')).toHaveClass('sr-only');
      expect(within(container).queryByText('Ctrl')).not.toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
      expect(recoverable).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
      consoleError.mockRestore();
    }
  });
});
