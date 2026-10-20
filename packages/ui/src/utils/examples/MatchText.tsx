import { useState } from 'react';
import { Input } from '../../components/Input';
import { useI18n } from '../../i18n/I18nProvider';
import { foldText, matchRanges, matchText } from '../match-text';

const NAMES = ['Función', 'Niño', 'Łódź', 'Øresund', 'İstanbul', 'straße'];

export default function MatchText() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('funcion');
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input aria-label={t('matchText.search')} value={query} onValueChange={(value) => setQuery(String(value))} />
      <ul aria-label={t('matchText.results')} className="grid gap-2 text-foreground">
        {NAMES.filter((name) => matchText(name, query, { locale })).map((name) => {
          const ranges = matchRanges(name, query, { locale });
          let from = 0;
          return (
            <li key={name}>
              {ranges.map(([start, end]) => {
                const before = name.slice(from, start);
                from = end;
                return (
                  <span key={start}>
                    {before}
                    <mark className="rounded-sm bg-warning/20 text-warning-chip-text">{name.slice(start, end)}</mark>
                  </span>
                );
              })}
              {name.slice(from)}
              <code className="ms-2 text-muted-foreground">{foldText(name, locale)}</code>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
