import { render, screen } from '@testing-library/react';
import { createFormatters, interpolate, localeDirection } from './format';
import { I18nProvider, builtInMessages, useI18n, type I18n } from './I18nProvider';
import { en } from './messages/en';
import { es } from './messages/es';

function Probe({ onValue }: { onValue: (i18n: I18n) => void }) {
  const i18n = useI18n();
  onValue(i18n);
  return <span data-testid="probe">{i18n.t('common.close')}</span>;
}

function capture(ui: (probe: React.ReactNode) => React.ReactElement) {
  let value: I18n | undefined;
  render(ui(<Probe onValue={(v) => (value = v)} />));
  if (!value) throw new Error('no i18n value');
  return value;
}

describe('message catalogs', () => {
  it('es covers exactly the en keys, with no empty strings', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    for (const value of [...Object.values(en), ...Object.values(es)]) expect(value.trim()).not.toBe('');
  });

  it('keeps the same placeholders in every translation', () => {
    // Top-level `{name}` / `{name, plural, …}` only (not the plural branch bodies).
    const names = (msg: string) => {
      const found: string[] = [];
      let depth = 0;
      for (let i = 0; i < msg.length; i++) {
        if (msg[i] === '{') {
          if (depth === 0) found.push(/^\{(\w+)/.exec(msg.slice(i))?.[1] ?? '');
          depth++;
        } else if (msg[i] === '}') depth--;
      }
      return found.sort();
    };
    for (const key of Object.keys(en) as (keyof typeof en)[]) expect(names(es[key]), key).toEqual(names(en[key]));
  });

  it('picks the catalog by language subtag and falls back to English', () => {
    expect(builtInMessages('es-MX')).toBe(es);
    expect(builtInMessages('ES')).toBe(es);
    expect(builtInMessages('fr')).toBe(en);
  });
});

describe('interpolate', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(interpolate('Page {page} of {total}', { page: 2, total: 9 }, 'en')).toBe('Page 2 of 9');
    expect(interpolate('Hi {name}', {}, 'en')).toBe('Hi {name}');
  });

  it('selects plural branches with Intl.PluralRules and formats #', () => {
    const msg = '{count, plural, =0 {No results} one {# result} other {# results}}';
    expect(interpolate(msg, { count: 0 }, 'en')).toBe('No results');
    expect(interpolate(msg, { count: 1 }, 'en')).toBe('1 result');
    expect(interpolate(msg, { count: 1200 }, 'en')).toBe('1,200 results');
    expect(interpolate(es['common.results'], { count: 1 }, 'es')).toBe('1 resultado');
    expect(interpolate(es['common.results'], { count: 3 }, 'es')).toBe('3 resultados');
  });
});

describe('localeDirection', () => {
  it('is rtl for Arabic, Hebrew, Persian and Urdu, ltr otherwise', () => {
    for (const l of ['ar', 'ar-EG', 'he', 'fa-IR', 'ur']) expect(localeDirection(l)).toBe('rtl');
    for (const l of ['en', 'es-ES', 'de', 'ja']) expect(localeDirection(l)).toBe('ltr');
  });
});

describe('formatters', () => {
  const date = new Date(2026, 2, 5, 14, 30);
  const enF = createFormatters('en-US', en);
  const esF = createFormatters('es-ES', es);

  it('formats numbers and currency per locale', () => {
    expect(enF.formatNumber(1234567.891, { maximumFractionDigits: 2 })).toBe('1,234,567.89');
    expect(esF.formatNumber(1234567.891, { maximumFractionDigits: 2 })).toBe('1.234.567,89');
    expect(enF.formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
    expect(esF.formatCurrency(1234.5, 'EUR').replace(/\s/g, ' ')).toBe('1234,50 €');
  });

  it('formats dates and lists per locale', () => {
    expect(enF.formatDate(date, { dateStyle: 'long' })).toBe('March 5, 2026');
    expect(esF.formatDate(date, { dateStyle: 'long' })).toBe('5 de marzo de 2026');
    expect(enF.formatList(['Ana', 'Ben', 'Cy'])).toBe('Ana, Ben, and Cy');
    expect(esF.formatList(['Ana', 'Ben', 'Cy'])).toBe('Ana, Ben y Cy');
  });

  it('formats relative time from a unit or against a reference date', () => {
    expect(enF.formatRelativeTime(-1, 'day')).toBe('yesterday');
    expect(esF.formatRelativeTime(-1, 'day')).toBe('ayer');
    expect(esF.formatRelativeTime(3, 'hour')).toBe('dentro de 3 horas');
    const now = date.getTime();
    expect(enF.formatRelativeTime(new Date(now - 5 * 60_000), now)).toBe('5 minutes ago');
    expect(esF.formatRelativeTime(new Date(now - 2 * 86_400_000), now)).toBe('anteayer');
  });
});

describe('I18nProvider / useI18n', () => {
  it('outside a provider: English, ltr', () => {
    const i18n = capture((probe) => <>{probe}</>);
    expect(i18n.locale).toBe('en');
    expect(i18n.dir).toBe('ltr');
    expect(screen.getByTestId('probe')).toHaveTextContent('Close');
  });

  it('uses the locale catalog and lets `messages` override single keys', () => {
    const i18n = capture((probe) => (
      <I18nProvider locale="es" messages={{ 'common.copy': 'Copiar al portapapeles' }}>
        {probe}
      </I18nProvider>
    ));
    expect(screen.getByTestId('probe')).toHaveTextContent('Cerrar');
    expect(i18n.t('common.copy')).toBe('Copiar al portapapeles');
    expect(i18n.t('pagination.page', { page: 3 })).toBe('Página 3');
    expect(i18n.formatNumber(0.5, { style: 'percent' }).replace(/\s/g, ' ')).toBe('50 %');
  });

  it('sets dir and lang on a display:contents wrapper; dir follows the locale unless given', () => {
    const { container, rerender } = render(
      <I18nProvider locale="ar">
        <p>نص</p>
      </I18nProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute('dir', 'rtl');
    expect(wrapper).toHaveAttribute('lang', 'ar');
    expect(wrapper).toHaveClass('contents');
    rerender(
      <I18nProvider locale="ar" dir="ltr">
        <p>نص</p>
      </I18nProvider>,
    );
    expect(container.firstElementChild).toHaveAttribute('dir', 'ltr');
  });

  it('applyTo="document" sets dir/lang on <html> and restores them on unmount', () => {
    const html = document.documentElement;
    html.setAttribute('lang', 'en');
    const { container, unmount } = render(
      <I18nProvider locale="he" applyTo="document">
        <p>שלום</p>
      </I18nProvider>,
    );
    expect(container.firstElementChild?.tagName).toBe('P');
    expect(html).toHaveAttribute('dir', 'rtl');
    expect(html).toHaveAttribute('lang', 'he');
    unmount();
    expect(html).not.toHaveAttribute('dir');
    expect(html).toHaveAttribute('lang', 'en');
  });
});
