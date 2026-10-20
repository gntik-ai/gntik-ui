import { I18nProvider } from '../../../i18n/I18nProvider';
import { formatBytes, type FormatBytesOptions } from '../../../i18n/format';
import { Thumbnail, ThumbnailList } from '../Thumbnail';

const FORMATS: FormatBytesOptions[] = [
  { locale: 'en' },
  { locale: 'es' },
  { unitDisplay: 'long' },
  { unitDisplay: 'narrow' },
  { base: 1024 },
  { base: 1024, locale: 'es', unitDisplay: 'long' },
  { unit: 'bit' },
  { unit: 'bit', unitDisplay: 'long' },
  { maximumFractionDigits: 2 },
];

/** Provider-localized sizes, a per-thumbnail override, and the shared formatter options. */
export default function ThumbnailSizes() {
  return (
    <div data-format-bytes-preview className="space-y-4">
      <I18nProvider locale="es">
        <ThumbnailList>
          <Thumbnail name="report-es.pdf" size={1536} />
          <Thumbnail name="report-en.pdf" size={1536} locale="en" />
        </ThumbnailList>
      </I18nProvider>
      <ul className="space-y-1 font-mono text-sm text-foreground">
        {FORMATS.map((options, index) => (
          <li key={index}>
            <code>{formatBytes(25_000_000, options)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
