import { Field, FieldDescription, FieldLabel } from '../Field/Field';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import { Switch } from './Switch';
import SwitchPending from './examples/SwitchPending';
import SwitchSettings from './examples/SwitchSettings';
import SwitchWithAccessibleLabel from './examples/SwitchWithAccessibleLabel';

describe('Switch', () => {
  it('shows label precedence with consistent visible and accessible labels in the live example', async () => {
    render(<SwitchWithAccessibleLabel />);
    expect(screen.getByRole('switch', { name: 'Email me' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Email me about updates' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it.each([
    [undefined, 'Email me'],
    ['Notify', 'Notify'],
  ])('uses accessible name %s / %s when a visible label is present', (ariaLabel, name) => {
    render(<Switch label="Email me" aria-label={ariaLabel} />);
    expect(screen.getByRole('switch', { name })).toHaveAttribute('aria-checked', 'false');
  });

  it('exposes role switch with its label and toggles with Space and Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Email alerts" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Email alerts' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.tab();
    expect(sw).toHaveFocus();
    await user.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{Enter}');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('toggles when its label is clicked', async () => {
    const user = userEvent.setup();
    render(<Switch label="Digest" />);
    await user.click(screen.getByText('Digest'));
    expect(screen.getByRole('switch', { name: 'Digest' })).toHaveAttribute('aria-checked', 'true');
  });

  it('ignores input while disabled', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Locked" disabled defaultChecked />);
    const sw = screen.getByRole('switch', { name: 'Locked' });
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('example has no axe violations', async () => {
    render(<SwitchSettings />);
    await expectNoAxeViolations();
  });
});

describe('invalid state', () => {
  it.each([false, true])('exposes invalid when checked=%s', (checked) => {
    const { rerender } = render(<Switch invalid checked={checked} aria-label="Accept terms" />);
    const control = screen.getByRole('switch');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('data-invalid');
    rerender(<Switch invalid aria-invalid="false" checked={checked} aria-label="Accept terms" />);
    expect(control).toHaveAttribute('aria-invalid', 'false');
    rerender(<Switch checked={checked} aria-label="Accept terms" />);
    expect(control).not.toHaveAttribute('aria-invalid');
    expect(control).not.toHaveAttribute('data-invalid');
  });
  it('inherits invalid from Field', () => {
    render(
      <Field invalid>
        <Switch invalid={false} aria-label="Accept terms" />
      </Field>,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('data-invalid');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('loading state', () => {
  it('exposes the busy state with a hidden spinner in the thumb', () => {
    render(<Switch loading checked={false} aria-label="Slack" />);
    const sw = screen.getByRole('switch', { name: 'Slack' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAttribute('aria-busy', 'true');
    expect(sw).toHaveAttribute('data-loading');
    expect(sw).not.toHaveAttribute('data-disabled');
    expect(sw).not.toBeDisabled();
    const spinner = sw.querySelector('svg');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(spinner?.parentElement).toHaveAttribute('class', expect.stringContaining('rounded-full'));
  });

  it.each([
    ['controlled', { checked: false }],
    ['uncontrolled', { defaultChecked: false }],
  ])('ignores click, Space and Enter while loading (%s)', async (_name, state) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Switch loading aria-label="Slack" onCheckedChange={onChange} {...state} />
        <button type="button">Next</button>
      </>,
    );
    const sw = screen.getByRole('switch', { name: 'Slack' });
    await user.click(sw);
    expect(sw).toHaveFocus();
    await user.keyboard(' ');
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });

  it('describes the saving state in English and Spanish', () => {
    const { unmount } = render(<Switch loading aria-label="Slack" />);
    expect(screen.getByRole('switch')).toHaveAccessibleDescription('Saving…');
    unmount();
    render(
      <I18nProvider locale="es">
        <Switch loading aria-label="Slack" />
      </I18nProvider>,
    );
    expect(screen.getByRole('switch')).toHaveAccessibleDescription('Guardando…');
  });

  it('prefers loadingLabel and keeps a caller aria-describedby', () => {
    render(
      <>
        <p id="hint">Posts to the channel</p>
        <Switch loading loadingLabel="Connecting…" aria-describedby="hint" aria-label="Slack" />
      </>,
    );
    const description = screen.getByRole('switch');
    expect(description).toHaveAccessibleDescription('Posts to the channel Connecting…');
    expect(description).not.toHaveAccessibleDescription(expect.stringContaining('Saving'));
  });

  it('keeps the Field description while loading', () => {
    render(
      <Field>
        <FieldLabel>Slack</FieldLabel>
        <Switch loading />
        <FieldDescription>Posts to the channel</FieldDescription>
      </Field>,
    );
    const description = screen.getByRole('switch').getAttribute('aria-describedby') ?? '';
    expect(description.split(' ').length).toBe(2);
    expect(screen.getByRole('switch')).toHaveAccessibleDescription(expect.stringContaining('Posts to the channel'));
    expect(screen.getByRole('switch')).toHaveAccessibleDescription(expect.stringContaining('Saving…'));
  });

  it('does not change the accessible name of a visibly labelled switch while loading', () => {
    render(<Switch loading label="Slack" />);
    const sw = screen.getByRole('switch', { name: 'Slack' });
    expect(sw).toHaveAccessibleDescription('Saving…');
  });

  it('lets an inherited Field disabled win over loading', () => {
    render(
      <Field disabled>
        <FieldLabel>Slack</FieldLabel>
        <Switch loading />
      </Field>,
    );
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('data-disabled');
    expect(sw).not.toHaveAttribute('aria-busy');
    expect(sw).not.toHaveAttribute('data-loading');
    expect(sw).not.toHaveAccessibleDescription();
    expect(sw.querySelector('svg')).toBeNull();
  });

  it('restores toggling when loading ends', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Switch loading aria-label="Slack" onCheckedChange={onChange} />);
    rerender(<Switch loading={false} aria-label="Slack" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch');
    expect(sw).not.toHaveAttribute('aria-busy');
    expect(sw).not.toHaveAttribute('data-loading');
    expect(sw).not.toHaveAttribute('aria-readonly');
    expect(sw.querySelector('svg')).toBeNull();
    expect(sw).not.toHaveAccessibleDescription();
    sw.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('lets disabled win over loading', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch loading disabled aria-label="Slack" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('data-disabled');
    expect(sw).not.toHaveAttribute('aria-busy');
    expect(sw).not.toHaveAttribute('data-loading');
    expect(sw).not.toHaveAccessibleDescription();
    expect(sw.querySelector('svg')).toBeNull();
    await user.click(sw);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps an explicit readOnly working when not loading', () => {
    render(<Switch readOnly aria-label="Slack" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-readonly', 'true');
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-busy');
  });

  it('renders the same DOM with loading unset or false', () => {
    const { container: unset } = render(<Switch label="Slack" />);
    const { container: off } = render(<Switch label="Slack" loading={false} />);
    expect(off.innerHTML.replace(/base-ui-_r_\w+_?/g, 'ID')).toBe(unset.innerHTML.replace(/base-ui-_r_\w+_?/g, 'ID'));
  });

  it('does not dim the wrapping label while busy', () => {
    render(<Switch loading label="Slack" />);
    expect(screen.getByText('Slack').closest('label')).not.toHaveClass('opacity-70');
  });

  it('example has no axe violations and clears loading when the request settles', async () => {
    const user = userEvent.setup();
    render(<SwitchPending />);
    await expectNoAxeViolations();
    const sw = screen.getByRole('switch', { name: 'Slack connector' });
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(sw).not.toHaveAttribute('aria-busy'));
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });
});
