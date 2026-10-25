import { withoutForcedColors } from '../test/without-forced-colors';
import { render } from '@testing-library/react';
import ResourceDetailPage from './Page';
import { shell } from './examples/shell';

vi.hoisted(() => {
  vi.useFakeTimers({ now: new Date('2026-10-23T12:00:00Z'), toFake: ['Date'] });
});
afterAll(() => vi.useRealTimers());

// React's client IDs advance across roots. Preserve their relationships while
// canonicalizing only the generated IDs so the original markup is comparable.
function stableIds(html: string) {
  const ids = new Map<string, string>();
  return html.replace(/_r_[\da-z]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `_stable_${ids.size}_`);
    return ids.get(id)!;
  });
}

it('preserves the original default shell markup', () => {
  const { container } = render(<ResourceDetailPage />);
  expect(stableIds(withoutForcedColors(container).innerHTML)).toMatchSnapshot();
});

it('preserves the original explicit shell markup', () => {
  const { container } = render(<ResourceDetailPage shell={shell} />);
  expect(stableIds(withoutForcedColors(container).innerHTML)).toMatchSnapshot();
});
