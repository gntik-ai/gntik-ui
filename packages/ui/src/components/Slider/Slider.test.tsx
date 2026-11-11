import { useState } from 'react';
import { Field, FieldLabel } from '../Field/Field';
import { Form } from '@base-ui/react/form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Slider } from './Slider';
import SliderRange from './examples/SliderRange';
import SliderSingle from './examples/SliderSingle';
import SliderWithInput from './examples/SliderWithInput';
import { I18nProvider } from '../../i18n/I18nProvider';

function setup(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Slider label="Volume" showValue defaultValue={50} onValueChange={onValueChange} {...props} />);
  return { user, onValueChange, thumb: screen.getByRole('slider', { name: 'Volume' }) };
}

describe('Slider', () => {
  it('exposes role slider with its label and value', () => {
    const { thumb } = setup();
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    expect(thumb).toHaveAttribute('min', '0');
    expect(thumb).toHaveAttribute('max', '100');
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('ArrowRight / ArrowUp increase by one step', async () => {
    const { user, thumb } = setup({ step: 2 });
    await user.tab();
    expect(thumb).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '52');
    await user.keyboard('{ArrowUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '54');
  });

  it('ArrowLeft / ArrowDown decrease by one step', async () => {
    const { user, thumb, onValueChange } = setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(thumb).toHaveAttribute('aria-valuenow', '49');
    await user.keyboard('{ArrowDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '48');
    expect(onValueChange).toHaveBeenLastCalledWith(48, expect.anything());
  });

  it('PageUp / PageDown move by the large step', async () => {
    const { user, thumb } = setup({ largeStep: 10 });
    await user.tab();
    await user.keyboard('{PageUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '60');
    await user.keyboard('{PageDown}{PageDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
  });

  it('Home / End jump to the minimum / maximum', async () => {
    const { user, thumb } = setup();
    await user.tab();
    await user.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
  });

  it('range: Tab moves between labelled thumbs that cannot cross', async () => {
    const user = userEvent.setup();
    render(<SliderRange />);
    const min = screen.getByRole('slider', { name: 'Minimum instances' });
    const max = screen.getByRole('slider', { name: 'Maximum instances' });
    await user.tab();
    expect(min).toHaveFocus();
    await user.keyboard('{End}');
    expect(min).toHaveAttribute('aria-valuenow', '7');
    await user.tab();
    expect(max).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(max).toHaveAttribute('aria-valuenow', '9');
  });

  it('ignores input while disabled', async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Locked" defaultValue={10} disabled />);
    const thumb = screen.getByRole('slider', { name: 'Locked' });
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '10');
    expect(thumb).toBeDisabled();
  });

  it.each([
    ['SliderSingle', SliderSingle],
    ['SliderRange', SliderRange],
  ] as const)('%s has no axe violations', async (_n, Example) => {
    render(<Example />);
    await expectNoAxeViolations();
  });
});

describe('invalid state', () => {
  it('marks every range input invalid and respects explicit aria-invalid', () => {
    const { rerender } = render(<Slider invalid label="Range" defaultValue={[20, 80]} />);
    const inputs = screen.getAllByRole('slider');
    expect(inputs).toHaveLength(2);
    for (const input of inputs) expect(input).toHaveAttribute('aria-invalid', 'true');
    rerender(<Slider invalid aria-invalid="false" label="Range" defaultValue={[20, 80]} />);
    for (const input of screen.getAllByRole('slider')) expect(input).toHaveAttribute('aria-invalid', 'false');
    rerender(<Slider label="Range" defaultValue={[20, 80]} />);
    for (const input of screen.getAllByRole('slider')) {
      expect(input).not.toHaveAttribute('aria-invalid');
      expect(input.closest('[data-invalid]')).toBeNull();
    }
  });
  it('inherits invalid from Field on every input', () => {
    render(
      <Field invalid>
        <Slider invalid={false} label="Range" defaultValue={[20, 80]} />
      </Field>,
    );
    for (const input of screen.getAllByRole('slider')) expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

it('keeps the focused thumb mounted when invalid state clears', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Slider invalid label="Volume" defaultValue={50} />);
  await user.tab();
  const input = screen.getByRole('slider');
  expect(input).toHaveFocus();
  rerender(<Slider label="Volume" defaultValue={50} />);
  expect(screen.getByRole('slider')).toBe(input);
  expect(input).toHaveFocus();
});

describe('paired input', () => {
  it('names the slider and spinbutton from the visible label', () => {
    render(<Slider label="Temperature" withInput min={0} max={2} step={0.1} defaultValue={0.7} />);
    expect(screen.getByRole('slider', { name: 'Temperature' })).toHaveAttribute('aria-valuenow', '0.7');
    expect(screen.getByRole('spinbutton', { name: 'Temperature' })).toHaveValue('0.7');
  });
});

it('synchronizes typed changes and slider keyboard moves without duplicate callbacks', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Slider
      aria-label="Temperature"
      withInput
      min={0}
      max={2}
      step={0.1}
      defaultValue={0.7}
      onValueChange={onValueChange}
    />,
  );
  const input = screen.getByRole('spinbutton', { name: 'Temperature' });
  const slider = screen.getByRole('slider', { name: 'Temperature' });
  await user.clear(input);
  await user.click(input);
  await user.paste('1.3');
  expect(slider).toHaveAttribute('aria-valuenow', '1.3');
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1.3, expect.anything());
  await user.tab({ shift: true });
  expect(slider).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(input).toHaveValue('1.4');
});

it.each([
  ['5', '{Tab}', '2'],
  ['1.37', '{Enter}', '1.4'],
  ['-3', '{Tab}', '0'],
])('commits %s with %s as %s', async (text, key, expected) => {
  const user = userEvent.setup();
  render(<Slider label="Temperature" withInput min={0} max={2} step={0.1} defaultValue={0.7} />);
  const input = screen.getByRole('spinbutton', { name: 'Temperature' });
  await user.clear(input);
  await user.paste(text);
  await user.keyboard(key);
  expect(input).toHaveValue(expected);
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', expected);
});

it('restores an empty input on blur without a value callback', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Slider label="Temperature" withInput defaultValue={0.7} step={0.1} onValueChange={onValueChange} />);
  const input = screen.getByRole('spinbutton');
  await user.clear(input);
  await user.tab();
  expect(input).toHaveValue('0.7');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0.7');
  expect(onValueChange).not.toHaveBeenCalled();
});

it('clamps each controlled range input against its neighbour on commit', async () => {
  function Range() {
    const [value, setValue] = useState<number | readonly number[]>([2, 8]);
    return (
      <Slider withInput value={value} onValueChange={setValue} min={0} max={10} thumbLabels={['Minimum', 'Maximum']} />
    );
  }
  const user = userEvent.setup();
  render(<Range />);
  const minimum = screen.getByRole('spinbutton', { name: 'Minimum' });
  const maximum = screen.getByRole('spinbutton', { name: 'Maximum' });
  await user.clear(minimum);
  await user.paste('9');
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '2');
  await user.tab();
  expect(minimum).toHaveValue('8');
  expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '8');
  await user.clear(maximum);
  await user.paste('1');
  await user.keyboard('{Enter}');
  expect(maximum).toHaveValue('8');
  expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '8');
});

it('keeps the Field label, validation and single submitted value on the slider', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  const validate = vi.fn(() => null);
  const { rerender } = render(
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        submit([...new FormData(event.currentTarget)]);
      }}
    >
      <Field name="temperature" validationMode="onChange" validate={validate}>
        <FieldLabel>Temperature</FieldLabel>
        <Slider withInput min={0} max={2} step={0.1} defaultValue={0.7} />
      </Field>
      <button type="submit">Submit</button>
    </Form>,
  );
  const slider = screen.getByRole('slider', { name: 'Temperature' });
  const input = screen.getByRole('spinbutton', { name: 'Temperature' });
  expect(input).not.toHaveAttribute('name');
  await user.click(screen.getByText('Temperature'));
  expect(slider).toHaveFocus();
  await user.click(input);
  await user.clear(input);
  await user.paste('1.3');
  await user.tab();
  expect(validate).toHaveBeenLastCalledWith(1.3, expect.anything());
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(submit).toHaveBeenCalledExactlyOnceWith([['temperature', '1.3']]);
  rerender(
    <Form>
      <Field name="temperature" invalid>
        <FieldLabel>Temperature</FieldLabel>
        <Slider withInput min={0} max={2} step={0.1} defaultValue={0.7} />
      </Field>
    </Form>,
  );
  expect(screen.getByRole('slider', { name: 'Temperature' })).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('spinbutton', { name: 'Temperature' })).not.toHaveAttribute('aria-invalid', 'true');
});

it('hides the header readout and disables every paired range control', () => {
  render(
    <Slider label="Range" withInput showValue disabled defaultValue={[2, 8]} thumbLabels={['Minimum', 'Maximum']} />,
  );
  expect(screen.queryByText('2 – 8')).not.toBeInTheDocument();
  expect(screen.getByText('Range')).toBeInTheDocument();
  for (const control of [...screen.getAllByRole('slider'), ...screen.getAllByRole('spinbutton')]) {
    expect(control).toBeDisabled();
  }
});

it.each(['sm', 'md'] as const)('defaults paired input size to %s and forwards presentation props', (size) => {
  const { rerender } = render(
    <Slider aria-label="Quota" withInput size={size} inputProps={{ unit: '%', hideSteppers: true }} />,
  );
  expect(screen.getByRole('spinbutton').parentElement).toHaveClass(size === 'sm' ? 'h-8' : 'h-9');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('%')).toHaveAttribute('aria-hidden', 'true');
  rerender(<Slider aria-label="Quota" withInput size={size} inputProps={{ size: 'sm' }} />);
  expect(screen.getByRole('spinbutton').parentElement).toHaveClass('h-8');
});

it('notifies once when stepping the paired input by keyboard', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Slider label="Temperature" withInput defaultValue={0.7} step={0.1} onValueChange={onValueChange} />);
  await user.click(screen.getByRole('spinbutton'));
  await user.keyboard('{ArrowUp}');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0.8');
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith(0.8, expect.anything());
});

it.each(['dark', 'light', 'high_contrast'])('SliderWithInput has no axe violations in %s', async (theme) => {
  render(
    <div className={theme}>
      <SliderWithInput />
    </div>,
  );
  expect(screen.getAllByRole('spinbutton')).toHaveLength(4);
  await expectNoAxeViolations();
});

it('translates the paired example labels in Spanish', () => {
  render(
    <I18nProvider locale="es">
      <SliderWithInput />
    </I18nProvider>,
  );
  expect(screen.getByRole('spinbutton', { name: 'Temperatura' })).toHaveValue('0.7');
  expect(screen.getByRole('slider', { name: 'Máximo de tokens' })).toBeInTheDocument();
});

it('restores unparsable text without a change callback', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Slider
      label="Temperature"
      withInput
      defaultValue={0.7}
      min={-2}
      max={2}
      step={0.1}
      onValueChange={onValueChange}
    />,
  );
  const input = screen.getByRole('spinbutton');
  await user.clear(input);
  await user.paste('-');
  await user.tab();
  expect(input).toHaveValue('0.7');
  expect(onValueChange).not.toHaveBeenCalled();
});

it('forwards largeStep, locale and formatting and accepts controlled updates', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const { rerender } = render(
    <Slider
      aria-label="Budget"
      withInput
      value={1250}
      max={5000}
      largeStep={500}
      locale="en-US"
      format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      onValueChange={onValueChange}
    />,
  );
  const input = screen.getByRole('spinbutton', { name: 'Budget' });
  expect(input).toHaveValue('$1,250');
  await user.click(input);
  await user.keyboard('{PageUp}');
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1750, expect.anything());
  rerender(<Slider aria-label="Budget" withInput value={2000} max={5000} />);
  expect(input).toHaveValue('2,000');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2000');
});

it('snaps from a fractional minimum without losing its precision', async () => {
  const user = userEvent.setup();
  render(<Slider label="Threshold" withInput min={0.05} max={2.05} step={0.1} defaultValue={0.15} />);
  const input = screen.getByRole('spinbutton');
  await user.clear(input);
  await user.paste('0.17');
  await user.keyboard('{Enter}');
  expect(input).toHaveValue('0.15');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0.15');
});

it('uses the visible label for the paired input when aria-label is also supplied', () => {
  render(<Slider label="Temperature" aria-label="Model temperature" withInput />);
  expect(screen.getByRole('spinbutton', { name: 'Temperature' })).toBeInTheDocument();
});
