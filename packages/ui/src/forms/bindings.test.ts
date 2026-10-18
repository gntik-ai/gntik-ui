import { toValueProps, toCheckedProps } from './bindings';

const control = () => ({
  name: 'role',
  value: undefined as string | undefined,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
  disabled: false,
  'aria-invalid': true as const,
});

describe('public form bindings', () => {
  it('normalizes undefined values and commits before touching the field', () => {
    const field = control();
    const order: string[] = [];
    field.onChange.mockImplementation(() => order.push('change'));
    field.onBlur.mockImplementation(() => order.push('blur'));
    const props = toValueProps(field);
    expect(props).toMatchObject({ name: 'role', value: null, disabled: false, 'aria-invalid': true });
    expect(props).not.toHaveProperty('onChange');
    props.onValueChange('editor');
    expect(field.onChange).toHaveBeenCalledWith('editor');
    expect(order).toEqual(['change', 'blur']);
  });

  it('normalizes undefined checked values and commits booleans', () => {
    const field = control();
    const props = toCheckedProps(field);
    expect(props.checked).toBe(false);
    expect(props).not.toHaveProperty('value');
    props.onCheckedChange(true);
    expect(field.onChange).toHaveBeenCalledWith(true);
  });
});

it('resolves descendants lazily when a form asks a bound control to focus', () => {
  const field = control();
  const props = toValueProps(field);
  const group = document.createElement('div');
  props.ref(group);
  const target = document.createElement('button');
  group.append(target);
  document.body.append(group);
  const handle = field.ref.mock.calls[0]?.[0] as unknown as { focus(): void };
  handle.focus();
  expect(target).toHaveFocus();
  group.remove();
});
