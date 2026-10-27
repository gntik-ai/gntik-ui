import { I18nProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ChatComposer } from './ChatComposer';

afterEach(() => vi.unstubAllGlobals());

it.each([
  ['Win32', 'en', 'Ctrl + Enter to send · Enter for a new line'],
  ['MacIntel', 'en', '⌘ + Enter to send · Enter for a new line'],
  ['iPhone', 'en', '⌘ + Enter to send · Enter for a new line'],
  ['', 'en', 'Ctrl + Enter to send · Enter for a new line'],
  ['Win32', 'es', 'Ctrl + Intro para enviar · Intro para una línea nueva'],
  ['MacIntel', 'es', '⌘ + Intro para enviar · Intro para una línea nueva'],
])('uses the %s hint in %s', (platform, locale, hint) => {
  vi.stubGlobal('navigator', { platform, userAgent: '', maxTouchPoints: 0 });
  render(
    <I18nProvider locale={locale}>
      <ChatComposer submitMode="mod+enter" onSubmit={() => {}} />
    </I18nProvider>,
  );
  expect(screen.getByText((_, node) => node?.tagName === 'P' && node.textContent === hint)).toBeInTheDocument();
});
