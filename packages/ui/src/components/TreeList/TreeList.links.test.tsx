import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentPropsWithRef } from 'react';
import { LinkProvider } from '../Link/Link';
import { TreeList } from './TreeList';
import type { TreeNode } from './tree-model';

const navigate = vi.fn();
function RouterLink({ onClick, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      {...props}
      data-router
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && event.button === 0) {
          event.preventDefault();
          navigate(props.href);
        }
      }}
    />
  );
}
const node: TreeNode = {
  id: 'guide',
  label: 'Getting started',
  href: '/docs/getting-started',
  children: [{ id: 'intro', label: 'Intro' }],
};
const setup = (disabled = false) =>
  render(
    <LinkProvider component={RouterLink}>
      <TreeList nodes={[{ ...node, disabled }]} defaultExpanded={['guide']} currentHref={node.href} />
    </LinkProvider>,
  );
beforeEach(() => navigate.mockClear());

it('renders router link treeitems owning sibling groups; click and Enter navigate, Space selects', async () => {
  const user = userEvent.setup();
  setup();
  const link = screen.getByRole('treeitem', { name: 'Getting started' });
  expect(link.tagName).toBe('A');
  expect(link).toHaveAttribute('data-router');
  expect(link).toHaveAttribute('aria-current', 'page');
  expect(link.parentElement).toHaveAttribute('role', 'none');
  const group = within(link.parentElement!).getByRole('group');
  expect(link).toHaveAttribute('aria-owns', group.id);
  await user.click(screen.getByText('Getting started'));
  expect(navigate).toHaveBeenLastCalledWith('/docs/getting-started');
  navigate.mockClear();
  await user.keyboard('{Enter}');
  expect(navigate).toHaveBeenCalledTimes(1);
  await user.keyboard(' ');
  expect(link).toHaveAttribute('aria-selected', 'true');
  expect(navigate).toHaveBeenCalledTimes(1);
});

it('preserves native modifier and middle click navigation for enabled links', () => {
  setup();
  const link = screen.getByRole('treeitem', { name: 'Getting started' });
  expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
  expect(fireEvent.click(link, { metaKey: true })).toBe(true);
  expect(fireEvent(link, new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }))).toBe(true);
  expect(navigate).not.toHaveBeenCalled();
});

it('blocks a disabled link plain click before the router', () => {
  setup(true);
  const link = screen.getByRole('treeitem', { name: 'Getting started' });
  expect(link).toHaveAttribute('aria-disabled', 'true');
  expect(fireEvent.click(link)).toBe(false);
  expect(navigate).not.toHaveBeenCalled();
});
it('blocks disabled link Ctrl and Cmd clicks', () => {
  setup(true);
  const link = screen.getByRole('treeitem', { name: 'Getting started' });
  expect(fireEvent.click(link, { ctrlKey: true })).toBe(false);
  expect(fireEvent.click(link, { metaKey: true })).toBe(false);
  expect(navigate).not.toHaveBeenCalled();
});
it('blocks a disabled link middle click', () => {
  setup(true);
  expect(
    fireEvent(
      screen.getByRole('treeitem', { name: 'Getting started' }),
      new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }),
    ),
  ).toBe(false);
  expect(navigate).not.toHaveBeenCalled();
});

it('passes original nodes to action and lazy loading during filtering', async () => {
  const user = userEvent.setup();
  const original: TreeNode = { id: 'remote', label: 'Remote', hasChildren: true };
  const action = vi.fn();
  const load = vi.fn<(node: TreeNode) => Promise<TreeNode[]>>(async () => [{ id: 'child', label: 'Child' }]);
  render(<TreeList nodes={[original]} filter="remote" onAction={action} loadChildren={load} />);
  await user.tab();
  await user.keyboard('{Enter}{ArrowRight}');
  expect(action.mock.calls[0]?.[0]).toBe(original);
  expect(load.mock.calls[0]?.[0]).toBe(original);
  expect(screen.getByRole('treeitem', { name: 'Child' })).toBeInTheDocument();
});
