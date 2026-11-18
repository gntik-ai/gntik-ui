import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';
import { Field, FieldLabel } from '../Field/Field';

const presets = [
  { value: 0, label: 'Precise' },
  { value: 1, label: 'Balanced' },
  { value: 2, label: 'Creative' },
];

it('draws only in-range ticks and decorative labels and announces the matching label', () => {
  const { container, rerender } = render(
    <Slider label="Temperature" min={0} max={2} step={0.1} value={1} marks={[-1, ...presets, 3]} />,
  );
  const ticks = container.querySelectorAll('[data-slider-mark]');
  expect([...ticks].map((tick) => (tick as HTMLElement).style.insetInlineStart)).toEqual(['0%', '50%', '100%']);
  for (const tick of ticks) expect(tick).toHaveAttribute('aria-hidden', 'true');
  for (const { label } of presets) expect(screen.getByText(label).closest('[aria-hidden]')).not.toBeNull();
  expect(screen.getByRole('slider', { name: 'Temperature' })).toHaveAttribute('aria-valuetext', 'Balanced, 1');
  rerender(<Slider label="Temperature" min={0} max={2} step={0.1} value={1.3} marks={presets} />);
  expect(screen.getByRole('slider', { name: 'Temperature' })).toHaveAttribute('aria-valuetext', '1.3');
});

it('keeps an uncontrolled value when marks are added, removed or emptied', async () => {
  const user = userEvent.setup();
  const warn = vi.spyOn(console, 'error');
  const { rerender } = render(<Slider label="Temperature" min={0} max={2} step={0.1} defaultValue={0.2} />);
  const thumb = screen.getByRole('slider', { name: 'Temperature' });
  await user.tab();
  await user.keyboard('{ArrowRight}');
  for (const marks of [presets, undefined, []]) {
    rerender(<Slider label="Temperature" min={0} max={2} step={0.1} defaultValue={0.2} marks={marks} />);
    expect(screen.getByRole('slider', { name: 'Temperature' })).toBe(thumb);
    expect(thumb).toHaveAttribute('aria-valuenow', '0.3');
  }
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

it('keeps sorted thumb order when an unsorted default range is edited', async () => {
  const user = userEvent.setup();
  render(
    <Slider label="Range" withInput defaultValue={[8, 2]} min={0} max={16} thumbLabels={['Minimum', 'Maximum']} />,
  );
  const input = screen.getByRole('spinbutton', { name: 'Minimum' });
  await user.clear(input);
  await user.paste('4');
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '4');
  expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '8');
});

it.each([
  ['ltr', 'ArrowRight', 1],
  ['ltr', 'ArrowLeft', 0],
  ['rtl', 'ArrowRight', 0],
  ['rtl', 'ArrowLeft', 1],
  ...(['ltr', 'rtl'] as const).flatMap((dir) => [
    [dir, 'ArrowUp', 1],
    [dir, 'ArrowDown', 0],
    [dir, 'PageUp', 1],
    [dir, 'PageDown', 0],
    [dir, 'End', 2],
    [dir, 'Home', 0],
  ]),
])('navigates adjacent marks in %s with %s', async (dir, key, expected) => {
  const user = userEvent.setup();
  const change = vi.fn();
  const commit = vi.fn();
  render(
    <div dir={dir as string}>
      <Slider
        label="Tiers"
        min={0}
        max={2}
        defaultValue={0.2}
        step={0.1}
        largeStep={1.5}
        marks={[0, 0.2, 1, 2]}
        restrictToMarks
        onValueChange={change}
        onValueCommitted={commit}
      />
    </div>,
  );
  await user.tab();
  await user.keyboard(`{${key}}`);
  expect(screen.getByRole('slider', { name: 'Tiers' })).toHaveAttribute('aria-valuenow', String(expected));
  expect(change).toHaveBeenCalledExactlyOnceWith(
    expected,
    expect.objectContaining({ reason: 'keyboard', activeThumbIndex: 0 }),
  );
  expect(commit).toHaveBeenCalledExactlyOnceWith(expected, expect.objectContaining({ reason: 'keyboard' }));
});

it.each(['ltr', 'rtl'])('range keyboard navigation keeps one mark between thumbs in %s', async (dir) => {
  const user = userEvent.setup();
  const change = vi.fn();
  const commit = vi.fn();
  render(
    <div dir={dir}>
      <Slider
        label="Replicas"
        min={1}
        max={16}
        defaultValue={[8, 2]}
        marks={[1, 2, 4, 8, 16]}
        restrictToMarks
        minStepsBetweenValues={1}
        thumbLabels={['Minimum', 'Maximum']}
        onValueChange={change}
        onValueCommitted={commit}
      />
    </div>,
  );
  await user.tab();
  const increase = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const decrease = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  await user.keyboard(`{${increase}}{${increase}}`);
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '4');
  expect(change).toHaveBeenCalledExactlyOnceWith([4, 8], expect.anything());
  expect(commit).toHaveBeenCalledTimes(1);
  await user.keyboard(`{Shift>}{${decrease}}{/Shift}`);
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '2');
  await user.keyboard('{End}');
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '4');
  await user.keyboard('{Home}');
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '1');
  await user.tab();
  await user.keyboard('{Home}');
  expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '2');
});

it('counts range gaps in marks even when their numeric separation is less than step', async () => {
  const user = userEvent.setup();
  render(
    <Slider
      label="Range"
      min={0}
      max={2}
      defaultValue={[0, 2]}
      marks={[0, 0.2, 1, 2]}
      restrictToMarks
      minStepsBetweenValues={1}
      thumbLabels={['Minimum', 'Maximum']}
    />,
  );
  await user.tab();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '0.2');
  await user.tab();
  await user.keyboard('{Home}');
  expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '1');
});

it.each(['ltr', 'rtl'])('Shift+Arrow moves one adjacent mark in %s in each direction', async (dir) => {
  const user = userEvent.setup();
  render(
    <div dir={dir}>
      <Slider label="Tiers" min={0} max={2} defaultValue={0.2} marks={[0, 0.2, 1, 2]} restrictToMarks />
    </div>,
  );
  await user.tab();
  for (const key of [dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', 'ArrowUp']) {
    await user.keyboard(`{Shift>}{${key}}{/Shift}`);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '1');
    await user.keyboard('{PageDown}');
  }
  for (const key of [dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft', 'ArrowDown']) {
    await user.keyboard(`{Shift>}{${key}}{/Shift}`);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
    await user.keyboard('{PageUp}');
  }
});

it.each([
  { marks: [0, 0.1234567, 1, 2], value: 0.1234567, min: 0, max: 2 },
  { marks: [1, 2, 4, 8, 16], value: [2, 8], min: 1, max: 16 },
])('submits exact mark values without native stepMismatch: $value', async ({ marks, value, min, max }) => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit([...new FormData(event.currentTarget)]);
      }}
    >
      <Slider label="Tiers" name="tiers" min={min} max={max} defaultValue={value} marks={marks} restrictToMarks />
      <button>Submit</button>
    </form>,
  );
  for (const input of screen.getAllByRole('slider')) {
    expect((input as HTMLInputElement).validity.stepMismatch).toBe(false);
    expect(input).toHaveAttribute('step', 'any');
  }
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(submit).toHaveBeenCalledExactlyOnceWith(
    typeof value === 'number'
      ? [['tiers', '0.1234567']]
      : [
          ['tiers', '2'],
          ['tiers', '8'],
        ],
  );
});

it('preserves Base UI keyboard event details and the Field-resolved name', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <Field name="resolved">
      <FieldLabel>Tiers</FieldLabel>
      <Slider
        name="ignored"
        min={0}
        max={2}
        defaultValue={0.2}
        marks={[0, 0.2, 1, 2]}
        restrictToMarks
        onValueChange={change}
      />
    </Field>,
  );
  await user.tab();
  await user.keyboard('{ArrowRight}');
  expect(change).toHaveBeenCalledExactlyOnceWith(
    1,
    expect.objectContaining({
      event: expect.objectContaining({ target: { name: 'resolved', value: 1 } }),
      reason: 'keyboard',
      activeThumbIndex: 0,
    }),
  );
});

it('keeps pointer values, changes, commits and Base UI details identical to a plain slider', () => {
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 240,
    bottom: 20,
    width: 240,
    height: 20,
    toJSON: () => ({}),
  });
  const run = (restricted: boolean) => {
    const changes = vi.fn();
    const commits = vi.fn();
    const { unmount } = render(
      <Field name="resolved">
        <Slider
          label="Temperature"
          name="ignored"
          min={0}
          max={2}
          step={0.1}
          defaultValue={0.2}
          marks={restricted ? presets : undefined}
          restrictToMarks={restricted}
          onValueChange={changes}
          onValueCommitted={commits}
        />
      </Field>,
    );
    const input = screen.getByRole('slider', { name: 'Temperature' });
    const control = input.parentElement!.parentElement!.parentElement!;
    fireEvent(
      control,
      new MouseEvent('pointerdown', { bubbles: true, button: 0, buttons: 1, clientX: 96, clientY: 10 }),
    );
    fireEvent(document, new MouseEvent('pointermove', { bubbles: true, buttons: 1, clientX: 144, clientY: 10 }));
    fireEvent(document, new MouseEvent('pointerup', { bubbles: true, button: 0, clientX: 144, clientY: 10 }));
    expect(input).toHaveAttribute('aria-valuenow', '1.2');
    expect(changes.mock.calls.map(([value]) => value)).toEqual([0.8, 1.2]);
    const result = {
      changes: changes.mock.calls.map(([value, details]) => ({
        value,
        reason: details.reason,
        index: details.activeThumbIndex,
        eventType: details.event.type,
        target: details.event.target,
        canceled: details.isCanceled,
        propagation: details.isPropagationAllowed,
      })),
      commits: commits.mock.calls.map(([value, details]) => ({
        value,
        reason: details.reason,
        eventType: details.event.type,
      })),
    };
    unmount();
    return result;
  };
  try {
    expect(run(true)).toEqual(run(false));
  } finally {
    rect.mockRestore();
  }
});

it('restores the rendered value when a keyboard change is canceled', async () => {
  const user = userEvent.setup();
  const commit = vi.fn();
  render(
    <Slider
      label="Tiers"
      min={0}
      max={2}
      defaultValue={0.2}
      marks={[0, 0.2, 1, 2]}
      restrictToMarks
      onValueChange={(_next, details) => details.cancel()}
      onValueCommitted={commit}
    />,
  );
  await user.tab();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0.2');
  expect(screen.getByRole('slider')).toHaveValue('0.2');
  expect(commit).not.toHaveBeenCalled();
});

it('keeps controlled values across marks changes and synchronizes the paired input', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <Slider
      label="Tiers"
      min={0}
      max={2}
      value={0.2}
      marks={[0, 0.2, 1, 2]}
      restrictToMarks
      withInput
      onValueChange={change}
    />,
  );
  await user.tab();
  await user.keyboard('{ArrowRight}');
  expect(change).toHaveBeenCalledExactlyOnceWith(1, expect.anything());
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0.2');
  rerender(<Slider label="Tiers" min={0} max={2} value={1} marks={presets} restrictToMarks withInput />);
  expect(screen.getByRole('spinbutton')).toHaveValue('1');
  rerender(<Slider label="Tiers" min={0} max={2} value={1} withInput />);
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '1');
});

it('keeps the current value and sends no callbacks when no mark satisfies the range gap', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const commit = vi.fn();
  render(
    <Slider
      label="Range"
      min={0}
      max={2}
      defaultValue={[0, 0.2]}
      marks={[0, 0.2, 1, 2]}
      minStepsBetweenValues={2}
      restrictToMarks
      onValueChange={change}
      onValueCommitted={commit}
    />,
  );
  await user.tab();
  await user.keyboard('{ArrowRight}{End}{Home}');
  expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '0');
  expect(change).not.toHaveBeenCalled();
  expect(commit).not.toHaveBeenCalled();
});

it.each(
  (['ltr', 'rtl'] as const).flatMap((dir) => [
    { dir, key: dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', minimum: 4, maximum: 16 },
    { dir, key: dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft', minimum: 1, maximum: 4 },
    { dir, key: 'ArrowUp', minimum: 4, maximum: 16 },
    { dir, key: 'ArrowDown', minimum: 1, maximum: 4 },
    { dir, key: 'PageUp', minimum: 4, maximum: 16 },
    { dir, key: 'PageDown', minimum: 1, maximum: 4 },
    { dir, key: 'Home', minimum: 1, maximum: 2 },
    { dir, key: 'End', minimum: 4, maximum: 16 },
  ]),
)(
  'range thumbs support $key in $dir with marks counted independently of largeStep',
  async ({ dir, key, minimum, maximum }) => {
    const user = userEvent.setup();
    render(
      <div dir={dir}>
        <Slider
          label="Replicas"
          min={1}
          max={16}
          defaultValue={[2, 8]}
          marks={[1, 2, 4, 8, 16]}
          largeStep={12}
          minStepsBetweenValues={1}
          restrictToMarks
          thumbLabels={['Minimum', 'Maximum']}
        />
      </div>,
    );
    await user.tab();
    await user.keyboard(`{${key}}`);
    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', String(minimum));
    await user.tab();
    await user.keyboard(`{${key}}`);
    expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', String(maximum));
  },
);

it('uses the root computed CSS direction for horizontal mark keys', async () => {
  const user = userEvent.setup();
  render(
    <Slider
      label="Tiers"
      style={{ direction: 'rtl' }}
      min={0}
      max={2}
      defaultValue={0.2}
      marks={[0, 0.2, 1, 2]}
      restrictToMarks
    />,
  );
  await user.tab();
  await user.keyboard('{ArrowLeft}');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '1');
});
