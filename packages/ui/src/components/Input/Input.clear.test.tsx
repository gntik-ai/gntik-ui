import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { I18nProvider } from '../../i18n';
import { Form, FormField } from '../../forms/FormField';
import { Field, FieldLabel } from '../Field';
import { Dialog, DialogContent, DialogTitle } from '../Dialog';
import { Input } from './Input';

describe('clearable Input', () => {
  it('clears an uncontrolled field, notifies in order and returns focus', async () => {
    const calls: string[] = [];
    render(
      <Input
        clearable
        defaultValue="billing"
        aria-label="Search projects"
        onValueChange={(v) => calls.push(v)}
        onClear={() => calls.push('clear')}
      />,
    );
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: 'Clear Search projects' });
    expect(input.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.click(button);
    expect(input).toHaveValue('');
    expect(calls).toEqual(['', 'clear']);
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('clears a controlled field', async () => {
    function Example() {
      const [value, setValue] = useState('billing');
      return <Input clearable value={value} onValueChange={setValue} aria-label="Search" />;
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it.each([
    { defaultValue: '' },
    { disabled: true, defaultValue: 'x' },
    { readOnly: true, defaultValue: 'x' },
    { clearable: false, defaultValue: 'x' },
  ])('hides the button for %o', (props) => {
    render(<Input clearable aria-label="Search" {...props} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('updates an uncontrolled FormField and its dirty state', async () => {
    function Example() {
      const form = useForm({ defaultValues: { search: 'billing' } });
      return (
        <Form form={form} onSubmit={() => {}}>
          <FormField name="search" label="Search">
            {(props) => <Input clearable {...props} value={undefined} defaultValue="billing" />}
          </FormField>
          <output>{form.watch('search')}</output>
        </Form>
      );
    }
    const { container } = render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(container.querySelector('[data-dirty]')).toBeInTheDocument();
  });

  it('consumes Escape only while it can clear, keeping the Dialog open', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Search</DialogTitle>
          <Input clearOnEscape defaultValue="billing" aria-label="Projects" />
        </DialogContent>
      </Dialog>,
    );
    const input = await screen.findByRole('textbox');
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('resolves labels and translations, with an explicit override', async () => {
    const { rerender } = render(
      <I18nProvider locale="es">
        <Field>
          <FieldLabel>Region</FieldLabel>
          <Input clearable defaultValue="billing" />
        </Field>
      </I18nProvider>,
    );
    expect(await screen.findByRole('button', { name: 'Borrar Region' })).toBeInTheDocument();
    rerender(<Input clearable defaultValue="billing" clearLabel="Reset search" aria-label="Region" />);
    expect(screen.getByRole('button', { name: 'Reset search' })).toBeInTheDocument();
    rerender(<Input clearable defaultValue="billing" />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    rerender(
      <>
        <span id="region-label">Region</span>
        <Input clearable defaultValue="billing" aria-labelledby="region-label" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Clear Region' })).toBeInTheDocument();
  });
});

it('preserves caller aria-invalid without clearable', () => {
  render(<Input aria-label="Email" aria-invalid="true" />);
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
});
