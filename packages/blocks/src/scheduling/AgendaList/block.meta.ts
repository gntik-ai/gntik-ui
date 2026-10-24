import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Agenda list',
  family: 'scheduling',
  status: 'beta',
  description:
    'Upcoming scheduled work grouped by day (Today/Tomorrow labels), each row with a kind tile, locale-formatted time range, location and kind badge; empty state included. hourCycle overrides the provider/runtime clock. timeZone defaults to I18nProvider (system when unset); TimeZone examples demonstrate UTC, an explicit New York override and a Spanish Madrid provider. Use the same zone on server and client. Locale examples show en-US, es-ES, then en-US with the 24-hour override.',
  uses: ['Badge', 'EmptyState'],
};
