import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { createKeyValueRow, mergeEnvRows, parseEnv, serializeEnv, validateKeyValueRows, type KeyValueRow } from './key-value';
import { KeyValueEditor } from './KeyValueEditor';
import KeyValueEditorEnv from './examples/KeyValueEditorEnv';
import KeyValueEditorHeaders from './examples/KeyValueEditorHeaders';

const rowsOf = (...pairs: Array<[string, string, boolean?]>) => pairs.map(([k, v, s]) => createKeyValueRow(k, v, s));

describe('KeyValueEditor', () => {
  it('Add appends a row and focuses its key (Enter and Space)', async () => {
    const user = userEvent.setup();
    render(<KeyValueEditor defaultValue={rowsOf(['A', '1'])} />);
    const add = screen.getByRole('button', { name: 'Add variable' });
    add.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Key, row 2' })).toHaveFocus());
    add.focus();
    await user.keyboard(' ');
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Key, row 3' })).toHaveFocus());
  });

  it('Tab order inside a row: key, value, secret toggle, remove', async () => {
    const user = userEvent.setup();
    render(<KeyValueEditor defaultValue={rowsOf(['A', '1'])} />);
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Key, row 1' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Value, row 1' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Secret value, row 1' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove row 1' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add variable' })).toHaveFocus();
  });

  it('Remove deletes the row, announces it and focuses the next row, then Add', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<KeyValueEditor defaultValue={rowsOf(['A', '1'], ['B', '2'])} onChange={onChange} />);
    screen.getByRole('button', { name: 'Remove row 1' }).focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ key: 'B' })]);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Key, row 1' })).toHaveValue('B'));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Key, row 1' })).toHaveFocus());
    expect(screen.getByRole('status')).toHaveTextContent('Row removed');
    screen.getByRole('button', { name: 'Remove row 1' }).focus();
    await user.keyboard(' ');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add variable' })).toHaveFocus());
    expect(screen.getByText('No variables yet.')).toBeInTheDocument();
  });

  it('secret toggle masks the value with a password field (aria-pressed)', async () => {
    const user = userEvent.setup();
    render(<KeyValueEditor defaultValue={rowsOf(['TOKEN', 'abc'])} />);
    const toggle = screen.getByRole('button', { name: 'Secret value, row 1' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const value = screen.getByLabelText('Secret value, row 1', { selector: 'input' });
    expect(value).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(value).toHaveAttribute('type', 'text');
  });

  it('validates duplicates, pattern, required key and value with linked messages', async () => {
    const onValidityChange = vi.fn();
    render(<KeyValueEditor requireValue defaultValue={rowsOf(['A', '1'], ['A', '2'], ['9X', '3'], ['', '4'], ['B', ''])} onValidityChange={onValidityChange} />);
    expect(screen.getByRole('textbox', { name: 'Key, row 1' })).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('textbox', { name: 'Key, row 2' })).toHaveAccessibleDescription('Duplicate key');
    expect(screen.getByRole('textbox', { name: 'Key, row 2' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', { name: 'Key, row 3' })).toHaveAccessibleDescription(/letters, digits and underscores/);
    expect(screen.getByRole('textbox', { name: 'Key, row 4' })).toHaveAccessibleDescription('Key is required');
    expect(screen.getByRole('textbox', { name: 'Value, row 5' })).toHaveAccessibleDescription('Value is required');
    await waitFor(() => expect(onValidityChange).toHaveBeenCalledWith(false, expect.any(Object)));
  });

  it('runs a custom validate', () => {
    render(<KeyValueEditor defaultValue={rowsOf(['PORT', 'abc'])} validate={(row) => (row.key === 'PORT' && !/^\d+$/.test(row.value) ? 'Must be a number' : undefined)} />);
    expect(screen.getByRole('textbox', { name: 'Value, row 1' })).toHaveAccessibleDescription('Must be a number');
  });

  it('Paste .env imports rows (comments ignored, existing keys updated) and returns focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<KeyValueEditor defaultValue={rowsOf(['A', 'old'])} onChange={onChange} />);
    const paste = screen.getByRole('button', { name: 'Paste .env' });
    await user.click(paste);
    expect(paste).toHaveAttribute('aria-expanded', 'true');
    const area = screen.getByRole('textbox', { name: '.env contents' });
    await waitFor(() => expect(area).toHaveFocus());
    await user.click(area);
    await user.paste('# comment\nA=new\nexport B="two words"\n');
    await user.click(screen.getByRole('button', { name: 'Add variables' }));
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ key: 'A', value: 'new' }), expect.objectContaining({ key: 'B', value: 'two words' })]);
    expect(screen.getByRole('status')).toHaveTextContent('2 variables imported');
    await waitFor(() => expect(paste).toHaveFocus());
  });

  it('Ctrl+V of multi-line KEY=value text in a key field imports rows', async () => {
    const user = userEvent.setup();
    render(<KeyValueEditor />);
    await user.click(screen.getByRole('textbox', { name: 'Key, row 1' }));
    await user.paste('X=1\nY=2');
    expect(screen.getByRole('textbox', { name: 'Key, row 1' })).toHaveValue('X');
    expect(screen.getByRole('textbox', { name: 'Value, row 2' })).toHaveValue('2');
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [rows, setRows] = useState<KeyValueRow[]>(rowsOf(['A', '1']));
      return (
        <>
          <KeyValueEditor value={rows} onChange={setRows} />
          <output>{serializeEnv(rows)}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.type(screen.getByRole('textbox', { name: 'Value, row 1' }), '2');
    expect(document.querySelector('output')).toHaveTextContent('A=12');
  });

  it('copies the rows as .env', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<KeyValueEditor defaultValue={rowsOf(['A', '1'], ['B', 'x y'])} />);
    await user.click(screen.getByRole('button', { name: 'Copy as .env' }));
    expect(writeText).toHaveBeenCalledWith('A=1\nB="x y"');
  });

  it('read-only hides editing controls', () => {
    render(<KeyValueEditor readOnly defaultValue={rowsOf(['A', '1'])} />);
    expect(screen.getByRole('textbox', { name: 'Key, row 1' })).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Add variable' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove row 1' })).not.toBeInTheDocument();
  });

  it('pure helpers: parse, serialize, merge, validate', () => {
    expect(parseEnv("# c\n\nexport A=1\nB = 'q #x'\nC=\"l1\\nl2\"\nD=v # trailing\nnoeq\n=bad")).toEqual([
      { key: 'A', value: '1' },
      { key: 'B', value: 'q #x' },
      { key: 'C', value: 'l1\nl2' },
      { key: 'D', value: 'v' },
    ]);
    expect(serializeEnv([{ key: 'A', value: '1' }, { key: '', value: 'x' }, { key: 'C', value: 'l1\nl2' }])).toBe('A=1\nC="l1\\nl2"');
    expect(parseEnv(serializeEnv([{ key: 'Q', value: 'say "hi" # now' }]))).toEqual([{ key: 'Q', value: 'say "hi" # now' }]);
    const merged = mergeEnvRows(rowsOf(['A', '1'], ['', '']), [{ key: 'A', value: '2' }, { key: 'B', value: '3' }]);
    expect(merged.map((r) => [r.key, r.value])).toEqual([['A', '2'], ['B', '3']]);
    const rows = rowsOf(['a', '1'], ['A', '2']);
    expect(validateKeyValueRows(rows)).toEqual({});
    expect(validateKeyValueRows(rows, { caseInsensitive: true })).toEqual({ [rows[1]!.id]: { key: 'duplicate' } });
  });

  it('examples have no axe violations', async () => {
    const { container } = render(
      <>
        <KeyValueEditorEnv />
        <KeyValueEditorHeaders />
      </>,
    );
    await expectNoAxeViolations();
    await userEvent.setup().click(within(container).getAllByRole('button', { name: 'Paste .env' })[0]!);
    await expectNoAxeViolations();
  });
});
