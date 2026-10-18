import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { I18nProvider } from '../i18n';
import { expectNoAxeViolations } from '../test/a11y';
import ToolParameters from './examples/FieldArrayToolParameters';
import RoutingRules from './examples/FieldArrayRoutingRules';
import NestedHeaders from './examples/FieldArrayNestedHeaders';
import { FieldArray, Form, FormField, schemaResolver, type FieldArrayProps } from '.';

type Values = { steps: { tool: string; timeoutMs: number; headers: { key: string }[] }[] };
const initial: Values = { steps: [{ tool: 'search', timeoutMs: 3000, headers: [{ key: 'Accept' }] }] };

type ExampleProps = Partial<Omit<FieldArrayProps<Values, 'steps'>, 'name' | 'children'>> & {
  onSubmit?: (values: Values) => void;
  values?: Values;
  resolver?: Resolver<Values>;
};
function Example({ onSubmit = () => {}, values = initial, resolver, ...props }: ExampleProps) {
  const form = useForm<Values>({ defaultValues: values, resolver });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FieldArray<Values, 'steps'>
        name="steps"
        label="Steps"
        defaultItem={{ tool: 'fetch', timeoutMs: 1000, headers: [] }}
        {...props}
      >
        {(row) => (
          <FormField
            name={row.name('tool')}
            label="Tool"
            rules={{ validate: (value) => value !== 'invalid' || 'Tool is required' }}
          >
            {(field) => <Input {...field} />}
          </FormField>
        )}
      </FieldArray>
      <Button type="submit">Save</Button>
    </Form>
  );
}

describe('FieldArray', () => {
  it('binds index paths and submits the original values through Form', async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} />);
    expect(screen.getByRole('textbox', { name: 'Tool' })).toHaveAttribute('name', 'steps.0.tool');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit.mock.calls[0]?.[0]).toEqual(initial));
    expect(screen.queryByRole('button', { name: /Move|Duplicate/ })).not.toBeInTheDocument();
  });

  it('adds a default item, focuses its first control, announces it and respects max', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Example max={3} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getAllByRole('textbox')[1]).toHaveFocus();
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('fetch');
    expect(screen.getByRole('status')).toHaveTextContent('Added Item 2.');
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getAllByRole('textbox')[2]).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Add item' })).toBeDisabled();
    expect(screen.getByText('Limit of 3 items reached.')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Limit of 3 items reached.');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit.mock.calls[0]?.[0].steps[1]).toEqual({ tool: 'fetch', timeoutMs: 1000, headers: [] }),
    );
  });

  it('removes middle, last and only rows, focusing the neighbour or Add', async () => {
    const user = userEvent.setup();
    render(
      <Example
        values={{ steps: ['search', 'fetch', 'parse'].map((tool) => ({ tool, timeoutMs: 3000, headers: [] })) }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Remove Item 2' }));
    expect(screen.getByDisplayValue('parse')).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Removed Item 2.');
    await user.click(screen.getByRole('button', { name: 'Remove Item 2' }));
    expect(screen.getByDisplayValue('search')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Remove Item 1' }));
    expect(screen.getByText('No items yet.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add item' })).toHaveFocus();
  });

  it('disables Remove when min is reached', () => {
    render(<Example min={1} />);
    expect(screen.getByRole('button', { name: 'Remove Item 1' })).toBeDisabled();
  });

  it('tabs through fields and actions, and supports Space on Add and Remove', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove Item 1' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add item' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Remove Item 1' })).toHaveFocus();
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getAllByRole('textbox')[1]).toHaveFocus();
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Removed Item 2.');
  });

  it('moves by Alt+Arrow, retaining the control, typed value and error; ignores end boundaries', async () => {
    const user = userEvent.setup();
    render(
      <Example
        reorderable
        values={{ steps: ['search', 'fetch', 'parse'].map((tool) => ({ tool, timeoutMs: 3000, headers: [] })) }}
      />,
    );
    const input = screen.getByDisplayValue('search');
    await user.clear(input);
    await user.type(input, 'invalid');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Tool is required')).toBeVisible();
    await user.click(input);
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(input).toHaveAttribute('name', 'steps.0.tool');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('name', 'steps.1.tool');
    const moved = screen.getByRole('group', { name: 'Item 2' });
    expect(within(moved).getByText('Tool is required')).toBeVisible();
    expect(within(moved).getByRole('textbox')).toHaveValue('invalid');
    expect(screen.getByRole('status')).toHaveTextContent('Moved to position 2 of 3.');
    expect(screen.getAllByRole('textbox').map((el) => (el as HTMLInputElement).value)).toEqual([
      'fetch',
      'invalid',
      'parse',
    ]);
    await user.click(screen.getByDisplayValue('parse'));
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(screen.getByDisplayValue('parse')).toHaveAttribute('name', 'steps.2.tool');
  });

  it('moves with buttons activated by Enter and Space, keeping focus on the moved control', async () => {
    const user = userEvent.setup();
    render(
      <Example
        reorderable
        values={{ steps: ['search', 'fetch', 'parse'].map((tool) => ({ tool, timeoutMs: 3000, headers: [] })) }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Move up Item 1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move down Item 3' })).toBeDisabled();
    const down = screen.getByRole('button', { name: 'Move down Item 1' });
    down.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByDisplayValue('search')).toHaveAttribute('name', 'steps.1.tool');
    expect(down).toHaveFocus();
    const up = screen.getByRole('button', { name: 'Move up Item 2' });
    up.focus();
    await user.keyboard(' ');
    expect(screen.getByDisplayValue('search')).toHaveAttribute('name', 'steps.0.tool');
    expect(screen.getByRole('status')).toHaveTextContent('Moved to position 1 of 3.');
  });

  it('duplicates current edited values below the original and respects max', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Example duplicable max={2} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: 'Tool' }), '-edited');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Duplicate Item 1' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('textbox').map((el) => (el as HTMLInputElement).value)).toEqual([
      'search-edited',
      'search-edited',
    ]);
    expect(screen.getByRole('status')).toHaveTextContent('Duplicated Item 1.');
    expect(screen.getByRole('status')).toHaveTextContent('Limit of 2 items reached.');
    const copy = screen.getAllByRole('textbox')[1]!;
    await user.clear(copy);
    await user.type(copy, 'copy');
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('search-edited');
    expect(screen.getByRole('button', { name: 'Duplicate Item 1' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit.mock.calls[0]?.[0].steps).toEqual([
        { tool: 'search-edited', timeoutMs: 3000, headers: [{ key: 'Accept' }] },
        { tool: 'copy', timeoutMs: 3000, headers: [{ key: 'Accept' }] },
      ]),
    );
  });

  it('shows an array rules error under the list and describes the fieldset', async () => {
    const user = userEvent.setup();
    render(
      <Example
        description="Configure steps."
        values={{ steps: [] }}
        rules={{ minLength: { value: 1, message: 'Add at least one step' } }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const error = await screen.findByText('Add at least one step');
    const list = screen.getByRole('group', { name: 'Steps' });
    expect(list).toHaveAccessibleDescription('Configure steps. Add at least one step');
    expect(list.getAttribute('aria-describedby')?.split(' ')).toContain(error.id);
  });

  it('shows a schemaResolver issue at the array path', async () => {
    const schema = z.object({
      steps: z
        .array(z.object({ tool: z.string(), timeoutMs: z.number(), headers: z.array(z.object({ key: z.string() })) }))
        .min(1, 'Add a step before saving'),
    });
    render(<Example values={{ steps: [] }} resolver={schemaResolver(schema)} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Add a step before saving')).toBeVisible();
    expect(screen.getByRole('group', { name: 'Steps' })).toHaveAccessibleDescription('Add a step before saving');
  });

  it('uses Spanish catalog strings for row actions, limits and announcements', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="es">
        <Example duplicable reorderable max={2} />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Subir Elemento 1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bajar Elemento 1' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Duplicar Elemento 1' }));
    expect(screen.getByRole('status')).toHaveTextContent('Duplicado Elemento 1.');
    expect(screen.getByText('Límite de 2 elementos alcanzado.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Quitar Elemento 2' }));
    expect(screen.getByRole('status')).toHaveTextContent('Quitado Elemento 2.');
    await user.click(screen.getByRole('button', { name: 'Añadir elemento' }));
    expect(screen.getByRole('status')).toHaveTextContent('Añadido Elemento 2.');
  });

  it('supports custom item and Add labels, a default factory, card layout and empty state', async () => {
    const user = userEvent.setup();
    render(
      <Example
        values={{ steps: [] }}
        layout="card"
        emptyState="Add your first step."
        itemLabel={(n) => `Step ${n}`}
        addLabel="Add step"
        defaultItem={() => ({ tool: 'factory', timeoutMs: 2000, headers: [] })}
      />,
    );
    expect(screen.getByText('Add your first step.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    expect(screen.getByRole('group', { name: 'Step 1' })).toBeVisible();
    expect(screen.getByRole('textbox')).toHaveValue('factory');
    expect(screen.getByRole('status')).toHaveTextContent('Added Step 1.');
    expect(screen.getByRole('button', { name: 'Remove Step 1' })).toBeVisible();
  });

  it('nests header paths and groups, isolates inner keyboard moves, and deep copies headers', async () => {
    const user = userEvent.setup();
    render(<NestedHeaders />);
    const steps = screen.getByRole('group', { name: 'Steps' });
    const outer = within(steps).getAllByRole('group', { name: 'Item 1' })[0]!;
    const inner = within(outer).getByRole('group', { name: 'Item 2' });
    const key = within(inner).getByRole('textbox', { name: 'Key' });
    expect(key).toHaveAttribute('name', 'steps.0.headers.1.key');
    await user.click(key);
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(key).toHaveAttribute('name', 'steps.0.headers.0.key');
    expect(key).toHaveFocus();
    await user.click(within(outer).getAllByRole('button', { name: 'Duplicate Item 1' }).at(-1)!);
    const copy = screen
      .getByRole('group', { name: 'Steps' })
      .querySelector<HTMLInputElement>('[name="steps.1.headers.0.key"]')!;
    expect(copy).toHaveValue('Content-Type');
    await user.clear(copy);
    await user.type(copy, 'Changed');
    expect(key).toHaveValue('Content-Type');
  });

  it('does not reorder an outer row when a non-reorderable nested list receives Alt+Arrow', async () => {
    function Nested() {
      const form = useForm<Values>({
        defaultValues: {
          steps: [
            { tool: 'search', timeoutMs: 3000, headers: [{ key: 'Accept' }] },
            { tool: 'fetch', timeoutMs: 1000, headers: [] },
          ],
        },
      });
      return (
        <FieldArray
          control={form.control}
          name="steps"
          defaultItem={{ tool: '', timeoutMs: 0, headers: [] }}
          reorderable
        >
          {(row) => (
            <FieldArray control={form.control} name={row.name('headers')} defaultItem={{ key: '' }}>
              {(header) => (
                <FormField control={form.control} name={header.name('key')} label="Key">
                  {(field) => <Input {...field} />}
                </FormField>
              )}
            </FieldArray>
          )}
        </FieldArray>
      );
    }
    render(<Nested />);
    const user = userEvent.setup();
    const key = screen.getByRole('textbox', { name: 'Key' });
    await user.click(key);
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(key).toHaveAttribute('name', 'steps.0.headers.0.key');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('submits edits and newly added nested items at their array paths', async () => {
    const onSubmit = vi.fn();
    function NestedForm() {
      const form = useForm<Values>({ defaultValues: initial });
      return (
        <Form form={form} onSubmit={onSubmit}>
          <FieldArray control={form.control} name="steps" defaultItem={{ tool: '', timeoutMs: 0, headers: [] }}>
            {(row) => (
              <FieldArray
                control={form.control}
                name={row.name('headers')}
                label="Headers"
                defaultItem={{ key: 'New' }}
              >
                {(header) => (
                  <FormField name={header.name('key')} label="Key">
                    {(field) => <Input {...field} />}
                  </FormField>
                )}
              </FieldArray>
            )}
          </FieldArray>
          <Button type="submit">Save</Button>
        </Form>
      );
    }
    render(<NestedForm />);
    const user = userEvent.setup();
    const headers = screen.getByRole('group', { name: 'Headers' });
    await user.click(within(headers).getByRole('button', { name: 'Add item' }));
    const added = within(headers).getAllByRole('textbox')[1]!;
    expect(added).toHaveAttribute('name', 'steps.0.headers.1.key');
    await user.clear(added);
    await user.type(added, 'Authorization');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        steps: [{ tool: 'search', timeoutMs: 3000, headers: [{ key: 'Accept' }, { key: 'Authorization' }] }],
      }),
    );
  });

  it('keeps nested arrays bound to the moved outer row', async () => {
    const onSubmit = vi.fn();
    function NestedForm() {
      const form = useForm<Values>({
        defaultValues: {
          steps: [
            { tool: 'search', timeoutMs: 3000, headers: [{ key: 'Accept' }] },
            { tool: 'fetch', timeoutMs: 1000, headers: [{ key: 'Content-Type' }] },
          ],
        },
      });
      return (
        <Form form={form} onSubmit={onSubmit}>
          <FieldArray
            control={form.control}
            name="steps"
            label="Steps"
            defaultItem={{ tool: '', timeoutMs: 0, headers: [] }}
            reorderable
          >
            {(row) => (
              <>
                <FormField name={row.name('tool')} label="Tool">
                  {(field) => <Input {...field} />}
                </FormField>
                <FieldArray
                  control={form.control}
                  name={row.name('headers')}
                  label="Headers"
                  defaultItem={{ key: 'New' }}
                >
                  {(header) => (
                    <FormField name={header.name('key')} label="Key">
                      {(field) => <Input {...field} />}
                    </FormField>
                  )}
                </FieldArray>
              </>
            )}
          </FieldArray>
          <Button type="submit">Save</Button>
        </Form>
      );
    }
    render(<NestedForm />);
    const user = userEvent.setup();
    await user.click(screen.getByDisplayValue('search'));
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(screen.getByDisplayValue('Accept')).toHaveAttribute('name', 'steps.1.headers.0.key');
    await user.click(
      within(screen.getAllByRole('group', { name: 'Headers' })[1]!).getByRole('button', { name: 'Add item' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        steps: [
          { tool: 'fetch', timeoutMs: 1000, headers: [{ key: 'Content-Type' }] },
          { tool: 'search', timeoutMs: 3000, headers: [{ key: 'Accept' }, { key: 'New' }] },
        ],
      }),
    );
  });

  describe.each(['dark', 'light', 'high_contrast'])('axe in %s', (theme) => {
    it.each([ToolParameters, RoutingRules, NestedHeaders])('has no violations in %s', async (Component) => {
      document.documentElement.classList.add(theme);
      try {
        render(<Component />);
        await expectNoAxeViolations();
      } finally {
        document.documentElement.classList.remove(theme);
      }
    });
  });
});
