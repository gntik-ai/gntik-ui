import { readFileSync } from 'node:fs';
import { createRef, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DescriptionListCard } from '../data-display/DescriptionListCard/DescriptionListCard';
import { NoAccessEmpty } from '../feedback/EmptyStates/EmptyStates';
import { withoutForcedColors } from './without-forced-colors';
import { PageHeader } from '../page-chrome/PageHeader/PageHeader';

// Static rendering keeps React's IDs deterministic; compare the pinned ordinary-colour markup.
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
  expect(withoutForcedColors(container).innerHTML).toBe(baseline.html[name]);
});
