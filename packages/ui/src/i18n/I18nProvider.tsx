import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { createFormatters, localeDirection, type I18nFormatters } from './format';
import { catalogs } from './messages';
import { en, type Messages } from './messages/en';

export type Direction = 'ltr' | 'rtl';

/** What useI18n() returns: the translator, Intl formatters, the locale and the text direction. */
export interface I18n extends I18nFormatters {
  locale: string;
  dir: Direction;
}

export interface I18nProviderProps {
  /** BCP 47 locale ("es", "es-MX", "ar"). Picks the built-in catalog by language; unknown → English. */
  locale: string;
  /** Overrides or additions on top of the built-in catalog (e.g. a full catalog for another language). */
  messages?: Partial<Messages>;
  /** Text direction; defaults to the locale's (rtl for Arabic, Hebrew, Persian, Urdu…). */
  dir?: Direction;
  /**
   * Where `dir` and `lang` are applied: `wrapper` (default) renders a `display: contents` div;
   * `document` sets them on `<html>` (also covers portalled overlays); `none` leaves it to you.
   */
  applyTo?: 'wrapper' | 'document' | 'none';
  children?: ReactNode;
}

const I18nContext = createContext<I18n | null>(null);
const DEFAULT_I18N: I18n = { locale: 'en', dir: 'ltr', ...createFormatters('en', en) };

/** The built-in catalog for a locale's language, falling back to English. */
export function builtInMessages(locale: string): Messages {
  const lang = locale.split(/[-_]/)[0]?.toLowerCase() ?? '';
  return (catalogs as Record<string, Messages | undefined>)[lang] ?? en;
}

/**
 * Locale, messages and direction for every kit component below it. Also sets Base UI's
 * direction, so arrow-key navigation (Tabs, Menu, Slider, Toolbar…) follows RTL.
 */
export function I18nProvider({ locale, messages, dir, applyTo = 'wrapper', children }: I18nProviderProps) {
  const direction = dir ?? localeDirection(locale);
  const value = useMemo<I18n>(() => {
    const merged: Messages = { ...builtInMessages(locale), ...messages };
    return { locale, dir: direction, ...createFormatters(locale, merged) };
  }, [locale, messages, direction]);

  useEffect(() => {
    if (applyTo !== 'document') return;
    const html = document.documentElement;
    const prev = { dir: html.getAttribute('dir'), lang: html.getAttribute('lang') };
    html.setAttribute('dir', direction);
    html.setAttribute('lang', locale);
    return () => {
      if (prev.dir === null) html.removeAttribute('dir');
      else html.setAttribute('dir', prev.dir);
      if (prev.lang === null) html.removeAttribute('lang');
      else html.setAttribute('lang', prev.lang);
    };
  }, [applyTo, direction, locale]);

  const content = <DirectionProvider direction={direction}>{children}</DirectionProvider>;
  return (
    <I18nContext.Provider value={value}>
      {applyTo === 'wrapper' ? (
        <div dir={direction} lang={locale} className="contents">
          {content}
        </div>
      ) : (
        content
      )}
    </I18nContext.Provider>
  );
}

/** Translator, Intl formatters, locale and direction. Outside an I18nProvider: English, LTR. */
export function useI18n(): I18n {
  return useContext(I18nContext) ?? DEFAULT_I18N;
}

/** The provider's value, or null outside one (lets components keep runtime-locale defaults). */
export function useOptionalI18n(): I18n | null {
  return useContext(I18nContext);
}

/**
 * `dir` for portalled overlays: rendered outside the provider's wrapper, they carry the
 * direction themselves. Undefined outside a provider, so the document's direction applies.
 */
export function usePortalDir(): Direction | undefined {
  return useContext(I18nContext)?.dir;
}
