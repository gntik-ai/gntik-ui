import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { TreeList } from './TreeList';
import type { TreeNode } from './tree-model';

const nodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'dialog', label: 'Dialog.tsx' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'remote', label: 'remote-assets', hasChildren: true },
  { id: 'docs', label: 'docs', children: [{ id: 'guide', label: 'getting-started.md' }] },
  { id: 'readme', label: 'README.md' },
];
const ids = () => screen.getAllByRole('treeitem').map((el) => el.dataset.id);
const item = (id: string) => screen.getAllByRole('treeitem').find((el) => el.dataset.id === id)!;

it('reveals matches and ancestors without changing selection or reporting filter expansion', async () => {
  const user = userEvent.setup();
  const onExpandedChange = vi.fn();
  const onSelectedChange = vi.fn();
  const props = { nodes, defaultExpanded: ['src'], defaultSelected: ['index'], onExpandedChange, onSelectedChange };
  const { rerender } = render(<TreeList {...props} filter="dialog" />);
  expect(ids()).toEqual(['src', 'components', 'dialog']);
  expect(item('src')).toHaveAttribute('aria-expanded', 'true');
  expect(item('components')).toHaveAttribute('aria-expanded', 'true');
  expect(item('dialog')).toHaveAttribute('aria-selected', 'false');
  item('components').focus();
  await user.keyboard('{ArrowLeft}');
  expect(ids()).toEqual(['src', 'components']);
  await user.keyboard('{ArrowRight}');
  expect(ids()).toEqual(['src', 'components', 'dialog']);
  rerender(<TreeList {...props} filter="md" />);
  expect(ids()).toEqual(['docs', 'guide', 'readme']);
  rerender(<TreeList {...props} />);
  expect(item('src')).toHaveAttribute('aria-expanded', 'true');
  expect(item('components')).toHaveAttribute('aria-expanded', 'false');
  expect(item('index')).toHaveAttribute('aria-selected', 'true');
  expect(onExpandedChange).not.toHaveBeenCalled();
  expect(onSelectedChange).not.toHaveBeenCalled();
});

it('keeps the full subtree of a matching branch reachable, including loaded children', async () => {
  const user = userEvent.setup();
  render(<TreeList nodes={nodes} filter="src" />);
  item('src').focus();
  await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
  expect(ids()).toEqual(['src', 'components', 'button', 'dialog', 'index']);
  expect(within(item('components')).getByRole('group')).toBeInTheDocument();
});

it('marks only matcher-reported plain labels using original accent and case ranges', () => {
  const data: TreeNode[] = [
    {
      id: 'parent',
      label: 'Configuración parent',
      children: [
        { id: 'match', label: 'Configuración' },
        { id: 'rich', label: 'Configuración rich', content: <strong>Rich</strong> },
        { id: 'custom', label: 'Other' },
      ],
    },
  ];
  const matcher = (node: TreeNode) => node.id !== 'parent';
  const { container, rerender } = render(<TreeList nodes={data} filter="configuracion" filterNode={matcher} />);
  expect(ids()).toEqual(['parent', 'match', 'rich', 'custom']);
  expect([...container.querySelectorAll('mark')].map((el) => el.textContent)).toEqual(['Configuración']);
  expect(screen.getByRole('status')).toHaveTextContent('3 matches');
  rerender(<TreeList nodes={nodes} filter="DIALOG" />);
  expect(container.querySelector('mark')?.outerHTML).toContain('>Dialog</mark>');
  expect(item('dialog')).toHaveTextContent('Dialog.tsx');
  expect(screen.getByRole('status')).toHaveTextContent('1 match');
});

it.each([
  ['en', '1 match', '3 matches'],
  ['es', '1 coincidencia', '3 coincidencias'],
])('announces match counts in %s only while filtering', (locale, one, many) => {
  const { container, rerender } = render(
    <I18nProvider locale={locale}>
      <TreeList nodes={nodes} filter="dialog" />
    </I18nProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent(one);
  rerender(
    <I18nProvider locale={locale}>
      <TreeList nodes={nodes} filter=".ts" />
    </I18nProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent(many);
  rerender(
    <I18nProvider locale={locale}>
      <TreeList nodes={nodes} />
    </I18nProvider>,
  );
  expect(container.querySelector('[role="status"], [aria-live]')).toBeNull();
});

it('hides the tree and shows the catalog empty message with zero matches', () => {
  render(<TreeList aria-label="Files" nodes={nodes} filter="zzz" />);
  expect(screen.getByRole('tree', { hidden: true })).toHaveAttribute('hidden');
  expect(screen.getByText('No matches.')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('0 matches');
});

it('moves the tab stop, arrows and typeahead only among visible nodes', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<TreeList nodes={nodes} defaultExpanded={['src']} />);
  await user.tab();
  await user.keyboard('{ArrowDown}');
  expect(item('components')).toHaveFocus();
  rerender(<TreeList nodes={nodes} defaultExpanded={['src']} filter="md" />);
  expect(item('docs')).toHaveAttribute('tabindex', '0');
  item('docs').focus();
  await user.keyboard('{ArrowDown}');
  expect(item('guide')).toHaveFocus();
  await user.keyboard('r');
  expect(item('readme')).toHaveFocus();
  await user.keyboard('{ArrowUp}');
  expect(item('guide')).toHaveFocus();
});

it.each(['Control', 'Meta'])(
  '%s+A selects only visible enabled nodes and preserves hidden selections',
  async (modifier) => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const data = [...nodes, { id: 'disabled', label: 'disabled.md', disabled: true }];
    const { rerender } = render(
      <TreeList
        nodes={data}
        defaultExpanded={['src']}
        filter="md"
        selectionMode="multiple"
        defaultSelected={['index']}
        onSelectedChange={onSelectedChange}
      />,
    );
    await user.tab();
    await user.keyboard(`{${modifier}>}a{/${modifier}}`);
    expect(onSelectedChange).toHaveBeenLastCalledWith(['index', 'docs', 'guide', 'readme']);
    rerender(<TreeList nodes={data} selectionMode="multiple" defaultExpanded={['src']} defaultSelected={['index']} />);
    expect(item('index')).toHaveAttribute('aria-selected', 'true');
  },
);

it('uses accent-insensitive default label matching', () => {
  const { container } = render(
    <TreeList
      nodes={[
        { id: 'config', label: 'Configuración' },
        { id: 'other', label: 'Other' },
      ]}
      filter="configuracion"
    />,
  );
  expect(ids()).toEqual(['config']);
  expect(container.querySelector('mark')).toHaveTextContent('Configuración');
});
