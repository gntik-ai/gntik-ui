import { useState, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldLabel } from '../Field';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { DatePicker, type DatePickerProps } from './DatePicker';
import DatePickerEditable from './examples/DatePickerEditable';
import DateRangePickerEditable from './examples/DateRangePickerEditable';

const today = new Date(2026, 4, 11);

function renderPicker(props: DatePickerProps = {}, wrapper?: (children: ReactNode) => ReactNode) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const picker = <DatePicker editable locale="en-US" today={today} onValueChange={onValueChange} {...props} />;
  const field = (
    <Field>
      <FieldLabel>Expires on</FieldLabel>
      {picker}
    </Field>
  );
  render(wrapper ? wrapper(field) : field);
  return { user, onValueChange };
}

const names = () => screen.getAllByRole('spinbutton').map((s) => s.getAttribute('aria-label'));
const texts = () => screen.getAllByRole('spinbutton').map((s) => s.textContent);
const chooseButton = () => screen.getByRole('button', { name: 'Choose date' });

describe('DatePicker editable', () => {
  it('renders locale-ordered segments in the labelled group, then the Choose date button', () => {
    renderPicker();
    const group = screen.getByRole('group', { name: 'Expires on' });
    expect(names()).toEqual(['Month', 'Day', 'Year']);
    expect(within(group).getAllByRole('spinbutton')).toHaveLength(3);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(chooseButton()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(chooseButton()).toHaveAttribute('aria-expanded', 'false');
    expect(group.compareDocumentPosition(chooseButton()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('orders the segments day, month, year in es-ES', () => {
    renderPicker({ locale: 'es-ES' }, (field) => <I18nProvider locale="es-ES">{field}</I18nProvider>);
    expect(names()).toEqual(['Día', 'Mes', 'Año']);
    expect(screen.getByRole('button', { name: 'Elegir fecha' })).toBeInTheDocument();
  });

  it('keeps the read-only combobox trigger when editable is unset', () => {
    render(<DatePicker locale="en-US" aria-label="Due" />);
    expect(screen.getByRole('combobox', { name: 'Due' })).toHaveAttribute('readonly');
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('emits a typed date once and opens the calendar on that month with that day focused', async () => {
    const { user, onValueChange } = renderPicker({ defaultMonth: new Date(2026, 0, 1) });
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('10012026');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
    expect(texts()).toEqual(['10', '01', '2026']);
    await user.click(chooseButton());
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('October 2026')).toBeInTheDocument();
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Thursday, October 1, 2026' })).toHaveFocus(),
    );
    expect(chooseButton()).toHaveAttribute('aria-expanded', 'true');
  });

  it('follows a date typed while the calendar is open', async () => {
    const { user } = renderPicker({ defaultOpen: true, defaultValue: new Date(2026, 4, 20) });
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('May 2026')).toBeInTheDocument();
    // The popup takes initial focus asynchronously; type only once it has, and focus is back on the segment.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    screen.getByRole('spinbutton', { name: 'Month' }).focus();
    expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveFocus();
    await user.keyboard('10012026');
    expect(within(await screen.findByRole('dialog')).getByText('October 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thursday, October 1, 2026' })).toHaveAttribute('tabindex', '0');
  });

  it('reports the new visible month in controlled month mode', async () => {
    const onMonthChange = vi.fn();
    function Controlled() {
      const [month, setMonth] = useState(new Date(2026, 8, 1));
      return (
        <Field>
          <FieldLabel>Expires on</FieldLabel>
          <DatePicker
            editable
            locale="en-US"
            today={today}
            month={month}
            onMonthChange={(m) => {
              onMonthChange(m);
              setMonth(m);
            }}
          />
        </Field>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('10012026');
    expect(onMonthChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
    await user.click(chooseButton());
    expect(within(await screen.findByRole('dialog')).getByText('October 2026')).toBeInTheDocument();
  });

  it('applies defaultMonth to the first open only, not after typing or reopening', async () => {
    const { user } = renderPicker({ defaultMonth: new Date(2026, 0, 1) });
    await user.click(chooseButton());
    expect(within(await screen.findByRole('dialog')).getByText('January 2026')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('03032026');
    await user.click(chooseButton());
    expect(within(await screen.findByRole('dialog')).getByText('March 2026')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(chooseButton());
    expect(within(await screen.findByRole('dialog')).getByText('March 2026')).toBeInTheDocument();
  });

  it('opens on the month a pending segment edit just committed when Alt+ArrowDown flushes it', async () => {
    const { user, onValueChange } = renderPicker();
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('10012026');
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('1');
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 0, 1));
    expect(within(await screen.findByRole('dialog')).getByText('January 2026')).toBeInTheDocument();
  });

  it.each([
    ['the button', async (user: ReturnType<typeof userEvent.setup>) => user.click(chooseButton())],
    [
      'Alt+ArrowDown',
      async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
        await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
      },
    ],
  ])('a calendar pick opened with %s rewrites the segments, closes and focuses the button', async (_how, open) => {
    const { user, onValueChange } = renderPicker({ defaultValue: new Date(2026, 2, 20) });
    await open(user);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Tuesday, March 3, 2026' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 3), { reason: 'calendar' });
    expect(texts()).toEqual(['03', '03', '2026']);
    await waitFor(() => expect(chooseButton()).toHaveFocus());
  });

  it('a picked March 3 replaces a stale typed value', async () => {
    const { user } = renderPicker({ defaultValue: new Date(2026, 2, 3), defaultMonth: new Date(2026, 2, 1) });
    const month = screen.getByRole('spinbutton', { name: 'Month' });
    await user.click(month);
    await user.keyboard('{Delete}');
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Tuesday, March 3, 2026' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(texts()).toEqual(['03', '03', '2026']);
    await waitFor(() => expect(chooseButton()).toHaveFocus());
  });

  it.each([
    ['the button', async (user: ReturnType<typeof userEvent.setup>) => user.click(chooseButton())],
    [
      'Alt+ArrowDown',
      async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
        await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
      },
    ],
  ])('with withTime a calendar pick opened with %s closes and focuses the button', async (_how, open) => {
    const { user, onValueChange } = renderPicker({
      withTime: true,
      hourCycle: 24,
      timeZone: 'UTC',
      defaultValue: new Date(Date.UTC(2026, 2, 20, 9, 30)),
    });
    await open(user);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Tuesday, March 3, 2026' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(Date.UTC(2026, 2, 3, 9, 30)), { reason: 'calendar' });
    await waitFor(() => expect(chooseButton()).toHaveFocus());
  });

  it('opens the calendar on the literal year of a typed year below 100', async () => {
    const { user, onValueChange } = renderPicker();
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('10010099');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]?.getFullYear()).toBe(99);
    await user.click(chooseButton());
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/^October 0?99$/)).toBeInTheDocument();
  });

  it('fills every segment from an ISO paste into the day segment and emits once', () => {
    const { onValueChange } = renderPicker();
    fireEvent.paste(screen.getByRole('spinbutton', { name: 'Day' }), {
      clipboardData: { getData: () => '2026-10-01' },
    });
    expect(texts()).toEqual(['10', '01', '2026']);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
  });

  it('reads a pasted numeric date in the locale order only', () => {
    const { onValueChange } = renderPicker({ locale: 'es-ES' }, (field) => (
      <I18nProvider locale="es-ES">{field}</I18nProvider>
    ));
    fireEvent.paste(screen.getByRole('spinbutton', { name: 'Día' }), {
      clipboardData: { getData: () => '01/02/2026' },
    });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 1, 1));
  });

  it('clears a filled segment with Backspace and emits null', async () => {
    const { user, onValueChange } = renderPicker({ defaultValue: new Date(2026, 9, 1) });
    await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
    await user.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null);
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveAttribute('aria-valuetext', 'Empty');
  });

  it.each<[string, Partial<DatePickerProps>, string]>([
    ['after max', { max: new Date(2026, 11, 31) }, '01052027'],
    ['before min', { min: new Date(2026, 0, 1) }, '01052025'],
    ['rejected by isDateDisabled', { isDateDisabled: (d) => d.getDay() === 0 }, '01032027'],
  ])('emits a typed date %s and marks the group invalid', async (_name, props, digits) => {
    const { user, onValueChange } = renderPicker(props);
    const group = screen.getByRole('group', { name: 'Expires on' });
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard(digits);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![0]).toBeInstanceOf(Date);
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('data-invalid');
  });

  it('inherits a disabled Field: segments and button are disabled and the calendar cannot change the value', async () => {
    const onValueChange = vi.fn();
    render(
      <Field disabled>
        <FieldLabel>Expires on</FieldLabel>
        <DatePicker
          editable
          locale="en-US"
          today={today}
          open
          defaultValue={new Date(2026, 4, 20)}
          onValueChange={onValueChange}
        />
      </Field>,
    );
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-disabled', 'true'));
    expect(chooseButton()).toBeDisabled();
    const user = userEvent.setup();
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Friday, May 15, 2026' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(texts()).toEqual(['05', '20', '2026']);
  });

  it('reflects an inherited invalid Field on a fresh render and after an edit', async () => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel>Expires on</FieldLabel>
        <DatePicker editable locale="en-US" today={today} defaultValue={new Date(2026, 4, 20)} />
      </Field>,
    );
    const group = screen.getByRole('group', { name: 'Expires on' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-invalid', 'true'));
    await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
    await user.keyboard('{ArrowUp}');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-invalid', 'true'));
  });

  it('has no axe violations with an invalid group', async () => {
    render(
      <Field invalid>
        <FieldLabel>Expires on</FieldLabel>
        <DatePicker editable locale="en-US" defaultValue={new Date(2026, 4, 20)} />
      </Field>,
    );
    expect(screen.getByRole('group', { name: 'Expires on' })).toHaveAttribute('aria-invalid', 'true');
    await expectNoAxeViolations();
  });

  it('submits the typed day through the hidden input', async () => {
    const { user } = renderPicker({ name: 'expires' });
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('10012026');
    expect(document.querySelector('input[name="expires"]')).toHaveValue('2026-10-01');
  });
});

describe('DatePicker editable withTime', () => {
  it('shows hour, minute and AM/PM after the date and emits a typed 12-hour value once, after the period', async () => {
    const { user, onValueChange } = renderPicker({ withTime: true });
    expect(names()).toEqual(['Month', 'Day', 'Year', 'Hours', 'Minutes', 'AM/PM']);
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('100120260230');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard('p');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1, 14, 30));
  });

  it('fills and emits a date-time pasted into a 12-hour picker', () => {
    const { onValueChange } = renderPicker({ withTime: true });
    fireEvent.paste(screen.getByRole('spinbutton', { name: 'Month' }), {
      clipboardData: { getData: () => '2026-10-01T14:30' },
    });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1, 14, 30));
    expect(screen.getByRole('spinbutton', { name: 'AM/PM' })).toHaveTextContent('PM');
  });

  it('adds seconds with withSeconds and follows hourCycle 24', () => {
    renderPicker({ withTime: true, withSeconds: true, hourCycle: 24 });
    expect(names()).toEqual(['Month', 'Day', 'Year', 'Hours', 'Minutes', 'Seconds']);
  });
});

describe('DatePicker editable in a zone', () => {
  beforeAll(() => vi.stubEnv('TZ', 'America/New_York'));
  afterAll(() => vi.unstubAllEnvs());

  it('types a wall time that the host clock skips as the same wall time in UTC', async () => {
    const { user, onValueChange } = renderPicker({ timeZone: 'UTC', withTime: true, hourCycle: 24, locale: 'sv-SE' });
    await user.click(screen.getByRole('spinbutton', { name: 'Year' }));
    await user.keyboard('202603080230');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(Date.UTC(2026, 2, 8, 2, 30)));
  });
});

describe('DatePicker editable re-zoning', () => {
  const instant = new Date(Date.UTC(2026, 9, 1, 14, 30));
  const field = (props: DatePickerProps) => (
    <Field>
      <FieldLabel>Expires on</FieldLabel>
      <DatePicker editable locale="en-US" withTime hourCycle={24} value={instant} {...props} />
    </Field>
  );

  it('redisplays and edits the same instant in the new zone when timeZone changes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(field({ timeZone: 'UTC', onValueChange }));
    expect(texts().slice(3)).toEqual(['14', '30']);
    rerender(field({ timeZone: 'America/New_York', onValueChange }));
    expect(texts().slice(3)).toEqual(['10', '30']);
    await user.click(screen.getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(Date.UTC(2026, 9, 1, 14, 31)));
  });
});

describe('DatePicker editable defaultMonth', () => {
  it('keeps the default month the picker first opened on when defaultMonth changes later', async () => {
    const user = userEvent.setup();
    const field = (defaultMonth: Date) => (
      <Field>
        <FieldLabel>Expires on</FieldLabel>
        <DatePicker editable locale="en-US" today={today} defaultMonth={defaultMonth} />
      </Field>
    );
    const { rerender } = render(field(new Date(2026, 0, 1)));
    await user.click(chooseButton());
    expect(await screen.findByRole('dialog')).toHaveTextContent('January 2026');
    rerender(field(new Date(2026, 3, 1)));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(chooseButton());
    expect(await screen.findByRole('dialog')).toHaveTextContent('January 2026');
  });
});

describe('DatePicker editable catalog', () => {
  it('uses the provider catalog for the button name', () => {
    render(
      <I18nProvider locale="en-US" messages={{ 'datePicker.choose': 'Open calendar' }}>
        <DatePicker editable aria-label="Due" />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Open calendar' })).toBeInTheDocument();
  });
});

describe('editable examples', () => {
  it.each([
    ['DatePickerEditable', DatePickerEditable],
    ['DateRangePickerEditable', DateRangePickerEditable],
  ])('%s has no axe violations, closed and with the calendar open', async (_name, Example) => {
    const user = userEvent.setup();
    render(<Example />);
    await expectNoAxeViolations();
    await user.click(screen.getAllByRole('button', { name: 'Choose date' })[0]!);
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
