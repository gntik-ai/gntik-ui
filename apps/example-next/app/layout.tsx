import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import './globals.css';
import { Providers } from './providers';
import { THEME_COOKIE, htmlClassFor, parseMode, themeScript } from './theme-script';

export const metadata: Metadata = {
  title: { default: 'gntik-ui · Next.js example', template: '%s · gntik-ui' },
  description: 'gntik-ui templates as Next.js App Router routes.',
};

/** Server Component: reads the theme cookie so the first HTML already carries the right theme. */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const mode = parseMode((await cookies()).get(THEME_COOKIE)?.value);
  const cls = htmlClassFor(mode);
  return (
    <html lang="en" className={cls || undefined} style={{ colorScheme: cls ? 'dark' : 'light' }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers initialMode={mode}>{children}</Providers>
      </body>
    </html>
  );
}
