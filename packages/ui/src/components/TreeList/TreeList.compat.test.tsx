import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { JsonViewer } from '../JsonViewer/JsonViewer';
import { TreeList } from './TreeList';
import * as model from './tree-model';

it('does not flatten again on unrelated renders, focus or selection with an empty filter', async () => {
  const flatten = vi.spyOn(model, 'flattenVisible');
  const nodes = [{ id: 'a', label: 'A', children: [{ id: 'b', label: 'B' }] }];
  const expanded = ['a'];
  const user = userEvent.setup();
  function Example() {
    const [count, setCount] = useState(0);
    return (
      <>
        <button onClick={() => setCount(count + 1)}>{count}</button>
        <TreeList nodes={nodes} expanded={expanded} />
      </>
    );
  }
  render(<Example />);
  const baseline = flatten.mock.calls.length;
  await user.click(screen.getByRole('button'));
  await user.tab();
  await user.keyboard('{ArrowDown} ');
  expect(flatten).toHaveBeenCalledTimes(baseline);
  flatten.mockRestore();
});

it('preserves the JsonViewer DOM (apart from permitted branch state attributes)', () => {
  const { container } = render(
    <JsonViewer data={{ outer: { name: 'Función' }, other: 2 }} search="funcion" toolbar={false} />,
  );
  const copy = container.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[data-open], [data-closed]').forEach((el) => {
    el.removeAttribute('data-open');
    el.removeAttribute('data-closed');
  });
  // React generated ids are deliberately opaque.
  const html = copy.innerHTML.replace(/_r_[\w]+_/g, 'REACT_ID');
  expect(html).toMatchSnapshot();
});

it('keeps empty child arrays as leaf items, including empty JSON containers', () => {
  render(<TreeList nodes={[{ id: 'empty', label: 'Empty', children: [] }]} />);
  expect(screen.getByRole('treeitem', { name: 'Empty' })).not.toHaveAttribute('aria-expanded');
  expect(screen.queryByRole('group')).toBeNull();
});
