import { readFileSync } from 'node:fs';
import { createRef, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DescriptionListCard } from '../data-display/DescriptionListCard/DescriptionListCard';
import { NoAccessEmpty } from '../feedback/EmptyStates/EmptyStates';
import { PageHeader } from '../page-chrome/PageHeader/PageHeader';
import { withoutForcedColors } from './without-forced-colors';

// Static rendering keeps React's generated IDs deterministic without masking any HTML differences.
// Captured before source edits at 6ec08de25c3311386f7ee97fc11605f2a7c307fe; never update from changed source.
const cases: [string, ReactNode][] = [
  ['description-list', <DescriptionListCard />],
  ['description-list', <DescriptionListCard columns={1} />],
  ['page-header', <PageHeader />],
  ['page-header-ref', <PageHeader titleRef={createRef<HTMLHeadingElement>()} />],
  ['no-access', <NoAccessEmpty />],
  ['no-access-handler', <NoAccessEmpty onRequestAccess={() => {}} />],
];

it.each(cases)('preserves the pinned %s innerHTML', (name, component) => {
  const baseline = JSON.parse(readFileSync(`${__dirname}/fixtures/opt-in-defaults.json`, 'utf8')) as {
    source: string;
    html: Record<string, string>;
  };
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(component);
  // Keep the captured fixture immutable. This change deliberately replaces only the header's
  // viewport classes with its own container; all other default markup must still match.
  const expected = name.startsWith('page-header')
    ? baseline.html[name]
        ?.replace('<header class="min-w-0">', '<header class="@container w-full min-w-0">')
        .replace('hidden shrink-0 items-center gap-2.5 sm:flex', 'hidden shrink-0 items-center gap-2.5 @xl:flex')
        .replace('flex shrink-0 items-center gap-2 sm:hidden', 'flex shrink-0 items-center gap-2 @xl:hidden')
    : baseline.html[name];
  expect(withoutForcedColors(container).innerHTML).toBe(expected);
});
