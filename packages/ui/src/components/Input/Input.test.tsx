import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'lucide-react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldLabel } from '../Field';
import { Input, InputKbd } from './Input';
import { IconButton } from '../Button';
import { CopyButton } from '../CopyButton';
import InputAddons from './examples/InputAddons';
import InputStates from './examples/InputStates';

describe('Input', () => {
  it('is a textbox that takes focus with Tab, then hands it to a trailing addon button', async () => {
    const user = userEvent.setup();
    render(<InputAddons />);
    const token = screen.getByLabelText('API token');
    token.focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Show token' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(token).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide token' })).toBeInTheDocument();
  });

  it('focuses from its Field label and accepts typing', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Field>
        <FieldLabel>Project</FieldLabel>
        <Input onValueChange={onValueChange} />
      </Field>,
    );
    await user.click(screen.getByText('Project'));
    const input = screen.getByRole('textbox', { name: 'Project' });
    expect(input).toHaveFocus();
    await user.keyboard('api');
    expect(input).toHaveValue('api');
    expect(onValueChange).toHaveBeenLastCalledWith('api', expect.anything());
  });

  it('marks invalid state on the input and the wrapper', () => {
    render(<Input aria-label="Email" invalid leadingIcon={Search} className="max-w-xs" />);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.parentElement).toHaveAttribute('data-invalid');
    expect(input.parentElement).toHaveClass('max-w-xs', 'h-control');
  });

  it('sets data-invalid from an invalid Field and stays out of tab order when disabled', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field invalid>
          <FieldLabel>Email</FieldLabel>
          <Input />
        </Field>
        <Input aria-label="Locked" disabled />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('data-invalid');
    await user.tab();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Locked' })).not.toHaveFocus();
  });

  it('applies the small size', () => {
    render(<Input aria-label="Small" size="sm" />);
    expect(screen.getByRole('textbox', { name: 'Small' }).parentElement).toHaveClass('h-8');
  });

  it('scales keyboard hints and implicit icon addons only inside large fields', () => {
    const { container } = render(
      <>
        <Input
          size="lg"
          aria-label="Large"
          leadingAddon={<IconButton icon={Search} label="Search" />}
          trailingAddon={
            <>
              <InputKbd>⌘K</InputKbd>
              <CopyButton value="fixture" tooltip={false} />
            </>
          }
        />
        <Input
          size="lg"
          aria-label="Explicit"
          trailingAddon={<IconButton icon={Search} label="Small action" size="sm" />}
        />
        <IconButton icon={Search} label="Standalone" />
        <InputKbd>Standalone hint</InputKbd>
      </>,
    );
    expect(screen.getByLabelText('Large').parentElement).toHaveClass('h-11');
    expect(container.querySelector('kbd')).toHaveClass('h-[22px]');
    expect(screen.getByRole('button', { name: 'Search' })).toHaveClass('size-9');
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveClass('size-9');
    expect(screen.getByRole('button', { name: 'Small action' })).toHaveClass('size-8');
    expect(screen.getByRole('button', { name: 'Standalone' })).toHaveClass('size-control');
    expect(screen.getByText('Standalone hint')).toHaveClass('h-[18px]');
  });

  it.each(['auto', 'sm', 'md', 'lg'] as const)('honors explicit %s addon sizes inside a large Input', (size) => {
    render(
      <Input
        size="lg"
        aria-label="Field"
        leadingAddon={<IconButton size={size} icon={Search} label="Action" />}
        trailingAddon={<CopyButton size={size} value="fixture" tooltip={false} />}
      />,
    );
    const metric = { auto: 'size-control', sm: 'size-8', md: 'size-9', lg: 'size-11' }[size];
    expect(screen.getByRole('button', { name: 'Action' })).toHaveClass(metric);
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveClass(metric);
  });

  it.each([undefined, 'auto', 'sm', 'md'] as const)('keeps compact hints and implicit addons at %s', (size) => {
    render(
      <Input
        size={size}
        aria-label="Field"
        trailingAddon={
          <>
            <InputKbd>⌘K</InputKbd>
            <IconButton icon={Search} label="Action" />
          </>
        }
      />,
    );
    expect(screen.getByText('⌘K')).toHaveClass('h-[18px]');
    expect(screen.getByRole('button', { name: 'Action' })).toHaveClass('size-control');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <InputAddons />
        <InputStates />
      </>,
    );
    await expectNoAxeViolations();
  });
});
