'use client';
import NextLink from 'next/link';
import { useEffect, type ComponentPropsWithRef, type ReactNode } from 'react';
import { LinkProvider, ThemeProvider, TooltipProvider, gntikPreset, useTheme } from '@gntik-ai/ui';
import { themeCookieValue, type ThemeMode } from './theme-script';

/** Kit links (NavList, breadcrumbs, Link) navigate client-side through next/link. */
function RouterLink({ href = '', ...props }: ComponentPropsWithRef<'a'>) {
  return <NextLink href={href} {...props} />;
}

/** Persists the chosen theme in the cookie the root layout reads on every request. */
function ThemeCookieSync() {
  const { mode } = useTheme();
  useEffect(() => {
    document.cookie = themeCookieValue(mode);
  }, [mode]);
  return null;
}

export function Providers({ initialMode, children }: { initialMode: ThemeMode; children: ReactNode }) {
  return (
    <ThemeProvider brand={gntikPreset} defaultMode={initialMode} storageKey={null}>
      <ThemeCookieSync />
      <LinkProvider component={RouterLink}>
        <TooltipProvider>{children}</TooltipProvider>
      </LinkProvider>
    </ThemeProvider>
  );
}
