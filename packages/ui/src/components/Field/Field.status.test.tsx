import { act, fireEvent, render, screen } from '@testing-library/react';
import { Field, FieldError, FieldLabel, FieldSuccess, FieldWarning, useFieldStatus } from './Field';
import { Input } from '../Input';
import { I18nProvider } from '../../i18n';

function Status() {
  const { status, invalid, validating } = useFieldStatus();
  return <output>{`${status}:${invalid}:${validating}`}</output>;
}

it('links a warning without invalidating or blocking submission', () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Field status="warning" data-testid="field">
        <FieldLabel>Limit</FieldLabel>
        <Input />
        <FieldWarning>Close to the plan limit.</FieldWarning>
      </Field>
      <button>Save</button>
    </form>,
  );
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Close to the plan limit.');
  expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  expect(screen.getByTestId('field')).toHaveAttribute('data-status', 'warning');
  fireEvent.click(screen.getByRole('button'));
  expect(submit).toHaveBeenCalledTimes(1);
});

it('gives invalid precedence over success and exposes a safe default outside Field', () => {
  render(
    <>
      <Status />
      <Field invalid status="success">
        <Input aria-label="Name" />
        <Status />
        <FieldError>Required.</FieldError>
        <FieldSuccess>Available.</FieldSuccess>
      </Field>
    </>,
  );
  expect(screen.getByText('idle:false:false')).toBeInTheDocument();
  expect(screen.getByText('error:true:false')).toBeInTheDocument();
  expect(screen.getByText('Required.')).toBeInTheDocument();
  expect(screen.queryByText('Available.')).not.toBeInTheDocument();
});

it.each(['en', 'es'])('announces validation and the settled message in %s', (locale) => {
  const field = (status: 'idle' | 'validating' | 'success') => (
    <I18nProvider locale={locale}>
      <Field status={status}>
        <Input aria-label="Slug" />
        <FieldSuccess>Slug is available.</FieldSuccess>
      </Field>
    </I18nProvider>
  );
  const view = render(field('idle'));
  const region = screen.getByRole('status');
  expect(region).toBeEmptyDOMElement();
  view.rerender(field('validating'));
  expect(region).toHaveTextContent(locale === 'es' ? 'Comprobando…' : 'Checking…');
  view.rerender(field('success'));
  expect(region).toHaveTextContent('Slug is available.');
  expect(screen.getByRole('status')).toBe(region);
});

it('preserves the focused control when optional status is enabled after the first render', () => {
  const field = (status?: 'validating') => (
    <Field status={status}>
      <FieldLabel>Slug</FieldLabel>
      <Input defaultValue="draft" />
    </Field>
  );
  const view = render(field());
  const input = screen.getByRole('textbox');
  act(() => input.focus());
  fireEvent.change(input, { target: { value: 'edited' } });
  view.rerender(field('validating'));
  expect(screen.getByRole('textbox')).toBe(input);
  expect(input).toHaveFocus();
  expect(input).toHaveValue('edited');
  view.rerender(field());
  expect(screen.getByRole('textbox')).toBe(input);
  expect(input).toHaveFocus();
});

it('leaves the status region empty for synchronous invalid changes', () => {
  const field = (invalid: boolean) => (
    <Field status="idle" invalid={invalid}>
      <FieldLabel>Slug</FieldLabel>
      <Input />
      <FieldError>Required.</FieldError>
    </Field>
  );
  const view = render(field(false));
  const region = screen.getByRole('status');
  expect(region).toBeEmptyDOMElement();
  view.rerender(field(true));
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Required.');
  expect(region).toBeEmptyDOMElement();
  view.rerender(field(false));
  expect(region).toBeEmptyDOMElement();
});
