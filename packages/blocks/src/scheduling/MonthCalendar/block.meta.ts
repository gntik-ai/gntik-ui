import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Month calendar',
  family: 'scheduling',
  status: 'beta',
  description:
    'Locale-first month grid of scheduled work with per-day event lines, today/selected states, month navigation and full grid keyboard support. weekStartsOn and hourCycle override provider/runtime defaults; data-weekend marks locale weekends without styling. timeZone defaults to I18nProvider (system when unset); TimeZone examples demonstrate UTC, an explicit New York override and a Spanish Madrid provider. Use the same zone on server and client. Locale examples show en-US, es-ES, then en-US with Monday-first and 24-hour overrides.',
  uses: ['Button', 'IconButton'],
};
