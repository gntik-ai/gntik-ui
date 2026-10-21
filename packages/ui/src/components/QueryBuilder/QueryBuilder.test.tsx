import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { QueryBuilder, type QueryBuilderProps } from './QueryBuilder';
import QueryBuilderBasic from './examples/QueryBuilderBasic';
import QueryBuilderEvaluate from './examples/QueryBuilderEvaluate';
import QueryBuilderRanges from './examples/QueryBuilderRanges';
import { deploymentFields, deploymentQuery } from './examples/fields';
import type { QueryGroup } from './query';

function setup(props: Partial<QueryBuilderProps> = {}) {
  const user = userEvent.setup();
  const onChange = vi.fn<(v: QueryGroup) => void>();
  render(<QueryBuilder aria-label="Filter" fields={deploymentFields} onChange={onChange} {...props} />);
  const last = () => onChange.mock.calls.at(-1)?.[0];
  return { user, onChange, last, root: screen.getByRole('group', { name: 'Filter' }) };
}

describe('QueryBuilder', () => {
  it('starts empty; Enter on Add condition adds one and focuses its field', async () => {
    const { user, last } = setup();
    expect(screen.getByText('No conditions: every record matches.')).toBeInTheDocument();
    const add = screen.getByRole('button', { name: 'Add condition' });
    add.focus();
    await user.keyboard('{Enter}');
    expect(last()?.children).toEqual([expect.objectContaining({ type: 'condition', field: 'name', operator: 'eq' })]);
    const condition = screen.getByRole('group', { name: 'Condition 1' });
    await waitFor(() => expect(within(condition).getByRole('combobox', { name: 'Field' })).toHaveFocus());
  });

  it('Tab walks field → operator → value → remove; typing sets the value', async () => {
    const { user, last } = setup();
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    const condition = screen.getByRole('group', { name: 'Condition 1' });
    await waitFor(() => expect(within(condition).getByRole('combobox', { name: 'Field' })).toHaveFocus());
    await user.tab();
    expect(within(condition).getByRole('combobox', { name: 'Operator' })).toHaveFocus();
    await user.tab();
    expect(within(condition).getByRole('textbox', { name: 'Value' })).toHaveFocus();
    await user.keyboard('api');
    expect(last()?.children[0]).toMatchObject({ field: 'name', operator: 'eq', value: 'api' });
    await user.tab();
    expect(within(condition).getByRole('button', { name: 'Remove condition 1' })).toHaveFocus();
  });

  it('Enter on a field opens its list; picking a field resets operator and value', async () => {
    const { user, last } = setup();
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    const field = within(screen.getByRole('group', { name: 'Condition 1' })).getByRole('combobox', { name: 'Field' });
    await waitFor(() => expect(field).toHaveFocus());
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('option', { name: 'Replicas' }));
    expect(last()?.children[0]).toMatchObject({ field: 'replicas', operator: 'eq', value: undefined });
    const condition = screen.getByRole('group', { name: 'Condition 1' });
    await user.click(within(condition).getByRole('combobox', { name: 'Operator' }));
    await user.click(await screen.findByRole('option', { name: 'is between' }));
    expect(within(condition).getByRole('textbox', { name: 'From' })).toBeInTheDocument();
    expect(within(condition).getByRole('textbox', { name: 'To' })).toBeInTheDocument();
  });

  it('ArrowRight + Enter switches AND to OR', async () => {
    const { user, last } = setup({ defaultValue: deploymentQuery });
    const root = screen.getByRole('group', { name: 'Filter' });
    const and = within(root).getAllByRole('button', { name: 'AND' })[0] as HTMLElement;
    and.focus();
    await user.keyboard('{ArrowRight}');
    const or = within(root).getAllByRole('button', { name: 'OR' })[0] as HTMLElement;
    expect(or).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(last()?.combinator).toBe('or');
  });

  it('Add group nests up to maxDepth; removing focuses Add condition', async () => {
    const { user, last } = setup({ maxDepth: 2 });
    await user.click(screen.getByRole('button', { name: 'Add group' }));
    const group = screen.getByRole('group', { name: 'Condition group' });
    expect(last()?.children[0]).toMatchObject({
      type: 'group',
      combinator: 'and',
      children: [expect.objectContaining({ type: 'condition' })],
    });
    expect(within(group).queryByRole('button', { name: 'Add group' })).not.toBeInTheDocument();
    await user.click(within(group).getByRole('button', { name: 'Remove condition 1' }));
    await waitFor(() => expect(within(group).getByRole('button', { name: 'Add condition' })).toHaveFocus());
    await user.click(within(group).getByRole('button', { name: 'Remove group' }));
    expect(last()?.children).toEqual([]);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add condition' })).toHaveFocus());
  });

  it('boolean fields need no value; the preview reads the tree', () => {
    render(
      <QueryBuilder
        aria-label="Filter"
        fields={deploymentFields}
        showPreview
        defaultValue={{
          type: 'group',
          id: 'r',
          combinator: 'and',
          children: [{ type: 'condition', id: 'a', field: 'public', operator: 'isTrue' }],
        }}
      />,
    );
    expect(within(screen.getByRole('group', { name: 'Condition 1' })).queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Public is true');
  });

  it('describes both inverted number inputs and clears the error when corrected', async () => {
    const { user, last } = setup({
      defaultValue: {
        type: 'group',
        id: 'range',
        combinator: 'and',
        children: [{ type: 'condition', id: 'number', field: 'replicas', operator: 'between' }],
      },
    });
    const from = screen.getByRole('textbox', { name: 'From' });
    const to = screen.getByRole('textbox', { name: 'To' });
    const message = "'From' must not be after 'To'.";
    await user.type(from, '10');
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expect(from).not.toHaveAttribute('aria-invalid');
    await user.type(to, '5');
    for (const input of [from, to]) {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription(message);
      expect(document.getElementById(input.getAttribute('aria-describedby') ?? '')).toHaveTextContent(message);
    }
    expect(last()?.children[0]).toMatchObject({ value: [10, 5] });
    const errorId = to.getAttribute('aria-describedby');
    await user.clear(to);
    await user.type(to, '20');
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    for (const input of [from, to]) {
      expect(input).not.toHaveAttribute('aria-invalid');
      expect(input).not.toHaveAttribute('aria-describedby');
    }
    await user.clear(to);
    await user.type(to, '5');
    expect(to).toHaveAttribute('aria-describedby', errorId);
    await user.clear(from);
    await user.type(from, '1');
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expect(last()?.children[0]).toMatchObject({ value: [1, 5] });
  });

  it.each([
    ['en', 'From', 'To', "'From' must not be after 'To'."],
    ['es', 'Desde', 'Hasta', '«Desde» no puede ser posterior a «Hasta».'],
  ])('describes controlled date ranges in %s only while inverted', (locale, fromLabel, toLabel, message) => {
    const view = (value: [string, string]) => (
      <I18nProvider locale={locale}>
        <QueryBuilder
          fields={deploymentFields}
          value={{
            type: 'group',
            id: 'range',
            combinator: 'and',
            children: [{ type: 'condition', id: 'date', field: 'createdAt', operator: 'between', value }],
          }}
        />
      </I18nProvider>
    );
    const { rerender } = render(view(['2026-03-10', '']));
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    rerender(view(['2026-03-10', '2026-03-01']));
    const inputs = [screen.getByRole('combobox', { name: fromLabel }), screen.getByRole('combobox', { name: toLabel })];
    for (const input of inputs) {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription(message);
      expect(document.getElementById(input.getAttribute('aria-describedby') ?? '')).toHaveTextContent(message);
    }
    rerender(view(['2026-03-10', '2026-03-20']));
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    for (const input of inputs) {
      expect(input).not.toHaveAttribute('aria-invalid');
      expect(input).not.toHaveAttribute('aria-describedby');
    }
  });

  it.each(['dark', 'light', 'high_contrast'])(
    'the invalid range example has no semantic axe violations in %s',
    async (theme) => {
      document.documentElement.className = theme === 'light' ? '' : theme;
      try {
        render(<QueryBuilderRanges />);
        expect(screen.getAllByText("'From' must not be after 'To'.")).toHaveLength(2);
        await expectNoAxeViolations();
      } finally {
        document.documentElement.className = '';
      }
    },
  );

  it.each([
    ['QueryBuilderBasic', QueryBuilderBasic],
    ['QueryBuilderEvaluate', QueryBuilderEvaluate],
  ] as const)('%s has no axe violations', async (_n, Example) => {
    render(<Example />);
    await expectNoAxeViolations();
  });
});
