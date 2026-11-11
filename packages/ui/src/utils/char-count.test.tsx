import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'lucide-react';
import { Field, FieldDescription, FieldLabel } from '../components/Field';
import { I18nProvider } from '../i18n';
import { expectNoAxeViolations } from '../test/a11y';
import InputCounter from '../components/Input/examples/InputCounter';
import TextareaCounter from '../components/Textarea/examples/TextareaCounter';
import { Input } from '../components/Input/Input';
import { Textarea } from '../components/Textarea/Textarea';

it.each(['dark', 'light', 'high_contrast'])('counter examples have no axe violations in %s', async (theme) => {
  render(
    <div className={theme} data-theme={theme}>
      <TextareaCounter />
      <InputCounter />
    </div>,
  );
  await expectNoAxeViolations();
});

it('preserves the base DOM without showCount', () => {
  const { container } = render(
    <>
      <Textarea id="plain" aria-label="Plain" defaultValue="hello" />
      <Textarea id="clearable" aria-label="Clearable" defaultValue="hello" clearable />
      <Input id="input" aria-label="Resource" defaultValue="api" trailingAddon=".svc" clearable />
    </>,
  );
  expect(container.innerHTML).toMatchSnapshot();
});

it('counts Textarea edits below the native hard limit without removing maxlength', async () => {
  const user = userEvent.setup();
  render(<Textarea aria-label="Note" showCount maxLength={280} defaultValue="hello" />);
  const control = screen.getByRole('textbox');
  expect(screen.getByText('5 / 280')).toHaveAttribute('aria-hidden', 'true');
  expect(control).toHaveAttribute('maxlength', '280');
  await user.type(control, 'abc');
  expect(screen.getByText('8 / 280')).toBeInTheDocument();
  await user.type(control, 'a'.repeat(280));
  expect(control).toHaveValue('helloabc' + 'a'.repeat(272));
});

it('allows Textarea edits beyond a soft limit and counts bytes with a custom strategy', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Textarea aria-label="Note" showCount maxCount={10} />);
  const control = screen.getByRole('textbox');
  await user.type(control, 'abcdefghijkl');
  expect(control).toHaveValue('abcdefghijkl');
  expect(control).toHaveAttribute('data-over-limit');
  expect(control).not.toHaveAttribute('aria-invalid');
  expect(control).not.toHaveAttribute('maxlength');
  expect(screen.getByText('12 / 10')).toHaveClass('text-destructive-text');
  rerender(
    <Textarea
      aria-label="Note"
      showCount
      maxCount={1}
      value="é"
      countStrategy={(v) => new TextEncoder().encode(v).length}
    />,
  );
  expect(screen.getByText('2 / 1')).toHaveClass('text-destructive-text');
});

it('places the Input counter inside the frame before addons, clear and trailing icon', async () => {
  const user = userEvent.setup();
  render(<Input aria-label="Resource" showCount maxLength={63} trailingAddon=".svc" trailingIcon={Search} clearable />);
  const control = screen.getByRole('textbox');
  await user.type(control, 'api');
  const counter = screen.getByText('3 / 63');
  expect(counter.parentElement).toBe(control.parentElement);
  expect(counter).toHaveAttribute('aria-hidden', 'true');
  expect(counter.compareDocumentPosition(screen.getByText('.svc')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(
    counter.compareDocumentPosition(screen.getByRole('button', { name: 'Clear Resource' })) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(counter.parentElement?.lastElementChild?.tagName.toLowerCase()).toBe('svg');
});

describe.each([
  ['Textarea', Textarea],
  ['Input', Input],
] as const)('%s accessible count', (_, Control) => {
  afterEach(() => vi.useRealTimers());

  it('tracks clearing, controlled replacement and maxCount precedence without claiming invalidity', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Control aria-label="Note" showCount maxCount={3} maxLength={10} defaultValue="hello" clearable />,
    );
    expect(screen.getByText('5 / 3')).toHaveClass('text-destructive-text');
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '10');
    const clear = screen.getByRole('button', { name: 'Clear Note' });
    if (Control === Textarea) {
      expect(clear).toHaveClass('absolute', 'top-2', 'end-2');
      expect(clear.parentElement).toBe(screen.getByRole('textbox').parentElement);
      expect(screen.getByText('5 / 3').parentElement).toHaveClass('justify-end');
    }
    await user.click(clear);
    expect(screen.getByText('0 / 3')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('data-over-limit');
    expect(screen.getByRole('textbox')).toHaveFocus();
    rerender(
      <Control
        aria-label="Note"
        showCount
        maxCount={1}
        value="é"
        countStrategy={(v) => new TextEncoder().encode(v).length}
      />,
    );
    expect(screen.getByText('2 / 1')).toHaveClass('text-destructive-text');
    expect(screen.getByRole('textbox')).toHaveAttribute('data-over-limit');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    rerender(<Control aria-label="Note" showCount maxCount={1} value="" />);
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('data-over-limit');
  });

  it('joins Field, caller and count descriptions, including Spanish and unlimited counts', () => {
    const { rerender } = render(
      <Field>
        <FieldLabel>Note</FieldLabel>
        <Control showCount maxLength={280} defaultValue="hello" aria-describedby="hint" />
        <FieldDescription>Useful context.</FieldDescription>
        <span id="hint">Extra hint.</span>
      </Field>,
    );
    const control = screen.getByRole('textbox');
    expect(control).toHaveAccessibleDescription(expect.stringContaining('Useful context.'));
    expect(control).toHaveAccessibleDescription(expect.stringContaining('Extra hint.'));
    expect(control).toHaveAccessibleDescription(expect.stringContaining('5 of 280 characters'));
    expect(screen.getByText('5 / 280')).toHaveAttribute('aria-hidden', 'true');
    rerender(
      <I18nProvider locale="es">
        <Control aria-label="Note" showCount maxLength={280} value="hello" />
      </I18nProvider>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('5 de 280 caracteres');
    rerender(<Control aria-label="Note" showCount value="a" />);
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('1 character');
    rerender(<Control aria-label="Note" showCount value="ab" />);
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('2 characters');
    rerender(
      <I18nProvider locale="es">
        <Control aria-label="Note" showCount value="a" />
      </I18nProvider>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('1 carácter');
    rerender(
      <I18nProvider locale="es">
        <Control aria-label="Note" showCount value="ab" />
      </I18nProvider>,
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('2 caracteres');
  });

  it('debounces crossings, stays silent on mount and below 80%, and announces each zone once', () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<Control aria-label="Note" showCount maxCount={10} />);
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    const edit = (value: string) => fireEvent.change(screen.getByRole('textbox'), { target: { value } });
    act(() => vi.advanceTimersByTime(500));
    expect(region).toBeEmptyDOMElement();
    edit('abc');
    act(() => vi.advanceTimersByTime(500));
    expect(region).toBeEmptyDOMElement();
    edit('abcdefgh');
    act(() => vi.advanceTimersByTime(499));
    expect(region).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(region).toHaveTextContent('2 characters left');
    edit('abcdefghi');
    act(() => vi.advanceTimersByTime(500));
    expect(region).toHaveTextContent('2 characters left');
    edit('abcdefg');
    act(() => vi.advanceTimersByTime(500));
    expect(region).toBeEmptyDOMElement();
    edit('abcdefgh');
    act(() => vi.advanceTimersByTime(100));
    edit('abcdefghijkl');
    act(() => vi.advanceTimersByTime(499));
    expect(region).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(region).toHaveTextContent('2 characters over the limit');
    expect(screen.getByRole('textbox')).toHaveAttribute('data-over-limit');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    edit('abcdefgh');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ['en', 9, '1 character left', 11, '1 character over the limit'],
    ['es', 8, 'Quedan 2 caracteres', 12, '2 caracteres por encima del límite'],
    ['es', 9, 'Queda 1 carácter', 11, '1 carácter por encima del límite'],
  ])('localizes %s warning and over-limit plurals at %i characters', (locale, near, left, over, message) => {
    vi.useFakeTimers();
    const { container } = render(
      <I18nProvider locale={locale}>
        <Control aria-label="Note" showCount maxCount={10} />
      </I18nProvider>,
    );
    const region = container.querySelector('[aria-live="polite"]');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a'.repeat(near) } });
    act(() => vi.advanceTimersByTime(500));
    expect(region).toHaveTextContent(left);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a'.repeat(over) } });
    act(() => vi.advanceTimersByTime(500));
    expect(region).toHaveTextContent(message);
  });

  it('does not announce prefilled values or unlimited edits', () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <Control aria-label="Note" showCount maxCount={10} defaultValue="abcdefghijkl" />,
    );
    const region = container.querySelector('[aria-live="polite"]');
    act(() => vi.advanceTimersByTime(500));
    expect(region).toBeEmptyDOMElement();
    rerender(<Control aria-label="Note" showCount />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x'.repeat(20) } });
    act(() => vi.advanceTimersByTime(500));
    expect(region).toBeEmptyDOMElement();
    expect(screen.getByText('20')).toHaveAttribute('aria-hidden', 'true');
  });
});
