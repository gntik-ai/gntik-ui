import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { currentPalette, observeTheme } from '@gntik-ai/tokens/runtime';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../utils/cn';
import { PortalContainerContext } from '../utils/portal';
import { ThemeContext, useTheme, type ResolvedTheme } from './ThemeProvider';

export interface ThemeScopeProps extends Omit<useRender.ComponentProps<'div'>, 'className'> {
  theme: ResolvedTheme;
  className?: string;
}

/** Applies a theme to a subtree and its overlays; mode/setMode still control the page. */
export function ThemeScope({ theme, children, className, render, ref, ...props }: ThemeScopeProps) {
  const page = useTheme();
  const [scopeElement, setScopeElement] = useState<HTMLElement | null>(null);
  const subscribe = useCallback(
    (changed: () => void) => (scopeElement ? observeTheme(changed, scopeElement) : () => {}),
    [scopeElement],
  );
  const getPalette = useCallback(
    () => (scopeElement ? currentPalette(scopeElement) : page.palette),
    [scopeElement, page.palette],
  );
  const palette = useSyncExternalStore(subscribe, getPalette, () => page.palette);
  const value = useMemo(() => ({ ...page, resolved: theme, palette }), [page, theme, palette]);
  const [container, setContainer] = useState<HTMLDivElement>();
  const initialTheme = useRef(theme);

  useEffect(() => {
    const portal = document.createElement('div');
    portal.className = initialTheme.current;
    portal.dataset.themeScopePortal = initialTheme.current;
    document.body.appendChild(portal);
    // Publish the mounted DOM node so already-open overlays also receive the container.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(portal);
    return () => portal.remove();
  }, []);

  useEffect(() => {
    if (!container) return;
    container.setAttribute('class', theme);
    container.setAttribute('data-theme-scope-portal', theme);
    container.setAttribute('data-palette', palette);
  }, [container, theme, palette]);

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [ref ?? null, setScopeElement],
    props: { ...props, className: cn(theme, className), 'data-theme-scope': theme, children },
  });

  return (
    <ThemeContext.Provider value={value}>
      <PortalContainerContext.Provider value={container}>{element}</PortalContainerContext.Provider>
    </ThemeContext.Provider>
  );
}
