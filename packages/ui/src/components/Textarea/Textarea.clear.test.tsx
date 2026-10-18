import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Textarea } from './Textarea';

it.each([false, true])('clears Textarea with controlled=%s, reserves space and returns focus', async (controlled) => {
  const calls: string[] = [];
  function Example() {
    const [value, setValue] = useState('Notes');
    return (
      <Textarea
        clearable
        aria-label="Notes"
        {...(controlled ? { value } : { defaultValue: 'Notes' })}
        onValueChange={(v) => {
          setValue(v);
          calls.push(v);
        }}
        onClear={() => calls.push('clear')}
      />
    );
  }
  render(<Example />);
  const textarea = screen.getByRole('textbox');
  expect(textarea).toHaveClass('pe-9');
  await userEvent.click(screen.getByRole('button', { name: 'Clear Notes' }));
  expect(textarea).toHaveValue('');
  expect(textarea).toHaveFocus();
  expect(calls).toEqual(['', 'clear']);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it.each([
  { defaultValue: '' },
  { disabled: true, defaultValue: 'x' },
  { readOnly: true, defaultValue: 'x' },
  { clearable: false, defaultValue: 'x' },
])('hides Textarea clear for %o', (props) => {
  render(<Textarea clearable aria-label="Notes" {...props} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
