import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { I18nProvider } from '../../i18n';
import { FileInput } from './FileInput';

const json = new File(['x'.repeat(2345)], 'sa-prod.json', { type: 'application/json' });
const picker = () => document.querySelector<HTMLInputElement>('input[type=file]:not([name])')!;

it.each([
  ['en', '2.3 kB'],
  ['es', '2,3 kB'],
])('renders a named file, icon and locale size in %s', (locale, size) => {
  render(
    <I18nProvider locale={locale}>
      <Field>
        <FieldLabel>Service account key</FieldLabel>
        <FileInput defaultValue={json} />
        <FieldDescription>Keep it private</FieldDescription>
      </Field>
    </I18nProvider>,
  );
  const control = screen.getByRole('button', { name: /Service account key.*sa-prod.json/ });
  expect(control).toHaveTextContent(size);
  expect(control.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(control).toHaveAccessibleDescription('Keep it private');
});

it('shows the empty placeholder without a size and names an unlabelled control', () => {
  render(<FileInput />);
  expect(screen.getByRole('button', { name: /Choose file/ })).toHaveTextContent('No file chosen');
  expect(screen.queryByText(/kB/)).not.toBeInTheDocument();
});

it.each([
  ['sm', 'size-8', '14'],
  ['md', 'size-9', '15'],
] as const)('sizes the clear action and file icon with the %s control', (size, clearSize, iconSize) => {
  render(<FileInput size={size} defaultValue={json} clearable />);
  expect(screen.getByRole('button', { name: 'Clear file' })).toHaveClass(clearSize);
  const icon = screen.getByRole('button', { name: /Choose file/ }).querySelector('svg');
  expect(icon).toHaveAttribute('width', iconSize);
  expect(icon).toHaveAttribute('height', iconSize);
});

it('accepts the same file twice, preserves cancellations, and clears with focus', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<FileInput clearable onValueChange={onValueChange} />);
  expect(screen.queryByRole('button', { name: 'Clear file' })).not.toBeInTheDocument();
  await user.upload(picker(), json);
  expect(screen.getByRole('button', { name: /Choose file.*sa-prod/ })).toHaveTextContent('sa-prod.json');
  await user.click(screen.getByRole('button', { name: /Choose file.*sa-prod/ }));
  await user.upload(picker(), json);
  expect(onValueChange).toHaveBeenCalledTimes(2);
  fireEvent(picker(), new Event('cancel'));
  fireEvent.change(picker(), { target: { files: [] } });
  expect(onValueChange).toHaveBeenCalledTimes(2);
  const clear = screen.getByRole('button', { name: 'Clear file' });
  expect(clear.parentElement).toBe(screen.getByRole('button', { name: /Choose file.*sa-prod/ }).parentElement);
  fireEvent.click(clear);
  expect(onValueChange).toHaveBeenLastCalledWith(null);
  expect(screen.getByRole('button', { name: /Choose file/ })).toHaveFocus();
  expect(screen.queryByRole('button', { name: 'Clear file' })).not.toBeInTheDocument();
});

it.each([
  ['en', '3 files', 'Choose files'],
  ['es', '3 archivos', 'Elegir archivos'],
])('counts multiple files and clears to an empty array in %s', (locale, count, name) => {
  const onValueChange = vi.fn();
  const files = [json, new File(['a'], 'a.json'), new File(['b'], 'b.json')];
  render(
    <I18nProvider locale={locale}>
      <FileInput multiple clearable onValueChange={onValueChange} />
    </I18nProvider>,
  );
  fireEvent.change(picker(), { target: { files } });
  expect(screen.getByRole('button', { name: new RegExp(name) })).toHaveTextContent(count);
  fireEvent.click(screen.getAllByRole('button')[1]!);
  expect(onValueChange).toHaveBeenLastCalledWith([]);
});

it.each([false, true])('lets renderValue replace the default for multiple=%s', (multiple) => {
  const props = multiple ? { multiple: true as const, value: [json, json] } : { value: json };
  render(<FileInput {...props} renderValue={() => 'Custom value'} />);
  expect(screen.getByRole('button')).toHaveTextContent('Custom value');
  expect(screen.queryByText('sa-prod.json')).not.toBeInTheDocument();
});

it('keeps rejected picks unchanged and accepts only valid files from a mixed pick', () => {
  const onValueChange = vi.fn();
  const onReject = vi.fn();
  render(
    <FileInput
      multiple
      accept=".json,application/json"
      maxSize={1_000_000}
      defaultValue={[json]}
      onValueChange={onValueChange}
      onReject={onReject}
    />,
  );
  const pem = new File(['key'], 'key.pem');
  const large = new File(['x'.repeat(3_000_000)], 'large.json', { type: 'application/json' });
  fireEvent.change(picker(), { target: { files: [pem] } });
  expect(onReject).toHaveBeenLastCalledWith([{ file: pem, reasons: ['type'] }]);
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).toHaveTextContent('sa-prod.json');
  fireEvent.change(picker(), { target: { files: [large] } });
  expect(onReject).toHaveBeenLastCalledWith([{ file: large, reasons: ['size'] }]);
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.change(picker(), { target: { files: [pem, json, large] } });
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith([json]);
  expect(onReject).toHaveBeenLastCalledWith([
    { file: pem, reasons: ['type'] },
    { file: large, reasons: ['size'] },
  ]);
});

it('inherits disabled and invalid Field state, including its sibling clear button', async () => {
  const { rerender } = render(
    <Field disabled>
      <FieldLabel>Key</FieldLabel>
      <FileInput clearable defaultValue={json} />
    </Field>,
  );
  expect(screen.getByRole('button', { name: /Key/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Clear file' })).toBeDisabled();
  const click = vi.spyOn(picker(), 'click');
  await userEvent.click(screen.getByRole('button', { name: /Key/ }));
  expect(click).not.toHaveBeenCalled();
  rerender(
    <Field invalid>
      <FieldLabel>Key</FieldLabel>
      <FileInput clearable defaultValue={json} />
      <FieldError match>Key is invalid</FieldError>
    </Field>,
  );
  expect(screen.getByRole('button', { name: /Key/ })).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('button', { name: /Key/ })).toHaveAccessibleDescription('Key is invalid');
});

it('honors React-prevented resets when native listeners drain microtasks before bubbling', async () => {
  // Model the trusted-event callback checkpoint absent from jsdom. Real clicks are covered in Playwright.
  vi.useFakeTimers({ toFake: ['queueMicrotask'] });
  try {
    const onReset = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const { container } = render(
      <form onReset={onReset}>
        <FileInput defaultValue={json} />
        <button type="reset">Reset</button>
      </form>,
    );
    const other = new File(['other'], 'other.json');
    fireEvent.change(picker(), { target: { files: [other] } });
    container.querySelector('form')!.addEventListener('reset', () => vi.runAllTicks());
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledOnce();
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(screen.getByRole('button', { name: /Choose file/ })).toHaveTextContent('other.json');
  } finally {
    vi.useRealTimers();
  }
});

it('synchronizes the separate named input and restores defaults or controlled values on form reset', async () => {
  // jsdom has no native DataTransfer: this verifies synchronization, not native FormData.
  class Transfer {
    files: File[] = [];
    items = { add: (file: File) => this.files.push(file) };
  }
  vi.stubGlobal('DataTransfer', Transfer);
  const setter = vi.spyOn(HTMLInputElement.prototype, 'files', 'set').mockImplementation(function (
    this: HTMLInputElement,
    files,
  ) {
    Object.defineProperty(this, 'files', { value: files, configurable: true, writable: true });
  });
  const { container, rerender } = render(
    <form>
      <FileInput name="credentials" defaultValue={json} clearable />
    </form>,
  );
  const named = () => container.querySelector<HTMLInputElement>('input[name=credentials]')!;
  expect(Array.from(named().files!)).toEqual([json]);
  fireEvent.click(screen.getByRole('button', { name: /Choose file/ }));
  fireEvent(picker(), new Event('cancel'));
  expect(Array.from(named().files!)).toEqual([json]);
  const other = new File(['other'], 'other.json');
  fireEvent.change(picker(), { target: { files: [other] } });
  expect(Array.from(named().files!)).toEqual([other]);
  await act(() => container.querySelector('form')!.reset());
  await waitFor(() => expect(screen.getByRole('button', { name: /Choose file/ })).toHaveTextContent('sa-prod.json'));
  expect(Array.from(named().files!)).toEqual([json]);
  fireEvent.click(screen.getByRole('button', { name: 'Clear file' }));
  expect(named().value).toBe('');
  expect(Array.from(named().files!)).toEqual([]);
  rerender(
    <form>
      <FileInput name="credentials" value={other} />
    </form>,
  );
  await act(() => container.querySelector('form')!.reset());
  expect(Array.from(named().files!)).toEqual([other]);
  expect(screen.getByRole('button')).toHaveTextContent('other.json');
  setter.mockRestore();
  vi.unstubAllGlobals();
});

it.each(['missing', 'constructor throws', 'assignment throws'])(
  'keeps controlled selection and clear usable when native file synchronization is unavailable: %s',
  (platform) => {
    class Transfer {
      constructor() {
        if (platform === 'constructor throws') throw new TypeError('DataTransfer is not constructible');
      }
      files: File[] = [];
      items = { add: (file: File) => this.files.push(file) };
    }
    vi.stubGlobal('DataTransfer', platform === 'missing' ? undefined : Transfer);
    const setter =
      platform === 'assignment throws'
        ? vi.spyOn(HTMLInputElement.prototype, 'files', 'set').mockImplementation(() => {
            throw new TypeError('File assignment is unavailable');
          })
        : undefined;
    try {
      const onValueChange = vi.fn();
      const { container, rerender } = render(
        <FileInput name="credentials" value={json} clearable onValueChange={onValueChange} />,
      );
      const control = screen.getByRole('button', { name: /Choose file/ });
      const other = new File(['other'], 'other.json', { type: 'application/json' });
      fireEvent.change(picker(), { target: { files: [other] } });
      expect(onValueChange).toHaveBeenLastCalledWith(other);
      expect(control).toHaveTextContent('sa-prod.json');
      fireEvent.click(screen.getByRole('button', { name: 'Clear file' }));
      expect(onValueChange).toHaveBeenLastCalledWith(null);
      expect(control).toHaveFocus();
      expect(control).toHaveTextContent('sa-prod.json');
      rerender(<FileInput name="credentials" value={null} clearable onValueChange={onValueChange} />);
      expect(control).toHaveTextContent('No file chosen');
      expect(screen.queryByRole('button', { name: 'Clear file' })).not.toBeInTheDocument();
      expect(container.querySelector<HTMLInputElement>('input[name=credentials]')!.value).toBe('');
    } finally {
      setter?.mockRestore();
      vi.unstubAllGlobals();
    }
  },
);
