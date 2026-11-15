import { render, screen } from '@testing-library/react';
import { Field } from './Field';
import { Input } from '../Input';
import { NumberInput } from '../NumberInput';

const cases = [
  ['validating', 'svg.animate-spin'],
  ['warning', 'svg.lucide-triangle-alert'],
  ['success', 'svg.lucide-circle-check'],
  ['error', 'svg.lucide-circle-alert'],
] as const;

describe.each([
  ['Input', Input],
  ['NumberInput', NumberInput],
] as const)('Field feedback in %s', (_name, Control) => {
  it.each(cases)('shows one decorative %s icon and only warns on the border', (status, selector) => {
    const { container } = render(
      <Field feedbackIcon status={status === 'error' ? 'success' : status} invalid={status === 'error'}>
        <Control aria-label="Value" />
      </Field>,
    );
    const icon = container.querySelector(selector);
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('[data-field-feedback]')).toHaveLength(1);
    const warningBorder = container.querySelector('.border-warning\\/70');
    expect(!!warningBorder).toBe(status === 'warning');
  });

  it('keeps default and idle DOM free of feedback', () => {
    const view = render(
      <Field>
        <Control aria-label="Value" />
      </Field>,
    );
    expect(view.container.querySelector('[data-status]')).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(view.container.querySelector('[data-field-feedback]')).toBeNull();
    view.rerender(
      <Field status="validating">
        <Control aria-label="Value" />
      </Field>,
    );
    expect(view.container.querySelector('[data-field-feedback]')).toBeNull();
    view.rerender(
      <Field status="idle" feedbackIcon>
        <Control aria-label="Value" />
      </Field>,
    );
    expect(view.container.querySelector('[data-field-feedback]')).toBeNull();
  });
});
