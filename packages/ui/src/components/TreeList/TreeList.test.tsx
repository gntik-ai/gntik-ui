import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import TreeListFiles from './examples/TreeListFiles';
import TreeListPermissions from './examples/TreeListPermissions';
import { TreeList } from './TreeList';
import type { TreeNode } from './tree-model';

const item = (name: string) => screen.getByRole('treeitem', { name: new RegExp(`^${name.replace('.', '\\.')}`) });

async function focusTree() {
  const user = userEvent.setup();
  render(<TreeListFiles />);
  await user.tab();
  return user;
}

describe('TreeList', () => {
  it('exposes the tree pattern', () => {
    render(<TreeListFiles />);
    const tree = screen.getByRole('tree', { name: 'Repository files' });
    const src = item('src');
    expect(src).toHaveAttribute('aria-expanded', 'true');
    expect(src).toHaveAttribute('aria-level', '1');
    expect(within(src).getAllByRole('group')[0]).toBeInTheDocument();
    expect(item('index.ts')).toHaveAttribute('aria-selected', 'true');
    expect(item('index.ts')).toHaveAttribute('aria-level', '2');
    expect(item('README.md')).not.toHaveAttribute('aria-expanded');
    expect(tree.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('Tab focuses the selected node', async () => {
    await focusTree();
    expect(item('index.ts')).toHaveFocus();
  });

  it('ArrowDown / ArrowUp move between visible nodes; Home / End jump', async () => {
    const user = await focusTree();
    await user.keyboard('{ArrowDown}');
    expect(item('remote-assets')).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(item('components')).toHaveFocus();
    await user.keyboard('{End}');
    expect(item('README.md')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(item('src')).toHaveFocus();
  });

  it('ArrowRight expands then enters; ArrowLeft collapses then goes to the parent', async () => {
    const user = await focusTree();
    await user.keyboard('{ArrowUp}');
    const components = item('components');
    expect(components).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(components).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(item('Button.tsx')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(components).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(components).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowLeft}');
    expect(item('src')).toHaveFocus();
  });

  it('Enter selects and runs onAction; Space selects', async () => {
    const user = await focusTree();
    await user.keyboard('{End}{Enter}');
    expect(item('README.md')).toHaveAttribute('aria-selected', 'true');
    expect(item('index.ts')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Opened README.md')).toBeInTheDocument();
    await user.keyboard('{Home} ');
    expect(item('src')).toHaveAttribute('aria-selected', 'true');
  });

  it('typeahead moves to the next matching label', async () => {
    const user = await focusTree();
    await user.keyboard('r');
    expect(item('remote-assets')).toHaveFocus();
    await user.keyboard('r');
    expect(item('README.md')).toHaveFocus();
  });

  it('loads children on first expand with a busy state', async () => {
    let resolve: (nodes: TreeNode[]) => void = () => {};
    const loader = vi.fn(() => new Promise<TreeNode[]>((r) => (resolve = r)));
    const user = userEvent.setup();
    render(<TreeList aria-label="Lazy" nodes={[{ id: 'a', label: 'Remote', hasChildren: true }]} loadChildren={loader} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    const remote = item('Remote');
    expect(remote).toHaveAttribute('aria-busy', 'true');
    expect(within(remote).getByText('Loading…')).toBeInTheDocument();
    resolve([{ id: 'b', label: 'child.txt' }]);
    await waitFor(() => expect(item('child.txt')).toBeInTheDocument());
    expect(remote).not.toHaveAttribute('aria-busy');
    await user.keyboard('{ArrowRight}');
    expect(item('child.txt')).toHaveFocus();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('multiple selection: Space toggles, Ctrl+A selects all, disabled nodes are skipped', async () => {
    const user = userEvent.setup();
    render(<TreeListPermissions />);
    const tree = screen.getByRole('tree');
    expect(tree).toHaveAttribute('aria-multiselectable', 'true');
    await user.tab();
    expect(item('View projects')).toHaveFocus();
    await user.keyboard(' ');
    expect(item('View projects')).toHaveAttribute('aria-selected', 'false');
    await user.keyboard('{ArrowDown} ');
    expect(item('Edit projects')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Control>}a{/Control}');
    expect(screen.getByText('7 selected')).toBeInTheDocument();
    expect(item('Manage payment methods')).toHaveAttribute('aria-disabled', 'true');
  });

  it('has no axe violations', async () => {
    const user = userEvent.setup();
    render(
      <>
        <TreeListFiles />
        <TreeListPermissions />
      </>,
    );
    await user.click(screen.getByText('remote-assets'));
    await expectNoAxeViolations();
  });
});
