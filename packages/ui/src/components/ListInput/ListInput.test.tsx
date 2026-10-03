import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { formatListInputPairs, parseListInputPairs } from './list-input-parse';
import { ListInput, type ListInputRow } from './ListInput';
import ListInputEnvVars from './examples/ListInputEnvVars';
import ListInputHeaders from './examples/ListInputHeaders';

function setup(props: Partial<Parameters<typeof ListInput>[0]> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn<(rows: ListInputRow[]) => void>();
  render(<ListInput label="Vars" defaultValue={[{ key: 'A', value: '1' }, { key: 'B', value: '2' }]} onValueChange={onValueChange} {...props} />);
  const pairs = () => onValueChange.mock.lastCall?.[0].map((r) => `${r.key}=${r.value}`);
  return { user, onValueChange, pairs };
}

describe('ListInput', () => {
  it('parses and formats KEY=value lines', () => {
    expect(parseListInputPairs('# c\nexport A="x y"\n\nB=1=2\nC')).toEqual([
      { key: 'A', value: 'x y' },
      { key: 'B', value: '1=2' },
      { key: 'C', value: '' },
    ]);
    expect(formatListInputPairs([{ key: 'A', value: '1' }])).toBe('A=1');
  });

  it('labels every field by row and edits values', async () => {
    const { user, pairs } = setup();
    expect(screen.getByRole('list', { name: 'Vars' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Value 2' }), '0');
    expect(pairs()).toEqual(['A=1', 'B=20']);
  });

  it('Enter on a key moves to its value; Enter on the last value adds a row', async () => {
    const { user, pairs } = setup();
    await user.click(screen.getByRole('textbox', { name: 'Key 2' }));
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox', { name: 'Value 2' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox', { name: 'Key 3' })).toHaveFocus();
    expect(pairs()).toEqual(['A=1', 'B=2', '=']);
    expect(screen.getByRole('status')).toHaveTextContent('Added a row.');
  });

  it('Alt+ArrowUp / Alt+ArrowDown reorder and keep focus', async () => {
    const { user, pairs } = setup();
    await user.click(screen.getByRole('textbox', { name: 'Value 2' }));
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(pairs()).toEqual(['B=2', 'A=1']);
    expect(screen.getByRole('textbox', { name: 'Value 1' })).toHaveFocus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(pairs()).toEqual(['A=1', 'B=2']);
    expect(screen.getByRole('textbox', { name: 'Value 2' })).toHaveFocus();
  });

  it('move and remove buttons work from the keyboard', async () => {
    const { user, pairs } = setup();
    screen.getByRole('button', { name: 'Move row 1 down' }).focus();
    await user.keyboard('{Enter}');
    expect(pairs()).toEqual(['B=2', 'A=1']);
    screen.getByRole('button', { name: 'Remove row 1' }).focus();
    await user.keyboard(' ');
    expect(pairs()).toEqual(['A=1']);
    expect(screen.getByRole('textbox', { name: 'Key 1' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Removed row 1.');
  });

  it('paste of KEY=value lines fills an empty row and adds the rest', async () => {
    const { user, pairs } = setup({ defaultValue: [] });
    await user.click(screen.getByRole('textbox', { name: 'Key 1' }));
    await user.paste('PORT=8080\nHOST=0.0.0.0\n# comment\nDEBUG=false');
    expect(pairs()).toEqual(['PORT=8080', 'HOST=0.0.0.0', 'DEBUG=false']);
    expect(screen.getByRole('status')).toHaveTextContent('Added 3 rows.');
  });

  it('flags duplicate keys and custom errors, linked by aria-describedby', async () => {
    const { user } = setup({ validate: (r) => ({ value: r.value === 'bad' ? 'Not allowed.' : null }) });
    const key2 = screen.getByRole('textbox', { name: 'Key 2' });
    await user.clear(key2);
    await user.type(key2, 'A');
    expect(key2).toHaveAttribute('aria-invalid', 'true');
    expect(key2).toHaveAccessibleDescription('Duplicate key');
    const value1 = screen.getByRole('textbox', { name: 'Value 1' });
    await user.clear(value1);
    await user.type(value1, 'bad');
    expect(value1).toHaveAccessibleDescription('Not allowed.');
  });

  it('masks secret values with a reveal toggle', async () => {
    const user = userEvent.setup();
    render(<ListInputEnvVars />);
    const value = screen.getByLabelText('Value 3');
    expect(value).toHaveAttribute('type', 'password');
    const reveal = screen.getByRole('button', { name: 'Show value 3' });
    expect(reveal).toHaveAttribute('aria-pressed', 'false');
    await user.click(reveal);
    expect(value).toHaveAttribute('type', 'text');
    expect(reveal).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Value 1')).toHaveAttribute('type', 'text');
  });

  it('respects maxRows', async () => {
    const { user } = setup({ maxRows: 2 });
    expect(screen.getByRole('button', { name: 'Add row' })).toBeDisabled();
    await user.click(screen.getByRole('textbox', { name: 'Value 2' }));
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Limit of 2 rows reached.');
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <ListInputEnvVars />
        <ListInputHeaders />
      </>,
    );
    await expectNoAxeViolations();
  });
});
