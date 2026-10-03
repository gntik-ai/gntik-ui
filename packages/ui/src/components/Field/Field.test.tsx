import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Input } from '../Input';
import { Field, FieldDescription, FieldError, FieldLabel, Fieldset, FieldsetLegend } from './Field';
import FieldValidation from './examples/FieldValidation';
import FieldsetAddress from './examples/FieldsetAddress';

describe('Field', () => {
  it('focuses the control when its label is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input />
      </Field>,
    );
    await user.click(screen.getByText('Project name'));
    expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveFocus();
  });

  it('announces description and error via aria-describedby when focused with Tab', async () => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel required>Work email</FieldLabel>
        <Input />
        <FieldDescription>We send invoices here.</FieldDescription>
        <FieldError match>Enter a valid work email.</FieldError>
      </Field>,
    );
    await user.tab();
    const input = screen.getByRole('textbox', { name: 'Work email' });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/We send invoices here\./);
    expect(input).toHaveAccessibleDescription(/Enter a valid work email\./);
  });

  it('hides the error while the field is valid', () => {
    render(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldError>Required.</FieldError>
      </Field>,
    );
    expect(screen.queryByText('Required.')).not.toBeInTheDocument();
  });

  it('names a fieldset with its legend and disables its fields', () => {
    render(
      <Fieldset disabled>
        <FieldsetLegend>Billing address</FieldsetLegend>
        <Field>
          <FieldLabel>City</FieldLabel>
          <Input />
        </Field>
      </Fieldset>,
    );
    expect(screen.getByRole('group', { name: 'Billing address' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'City' })).toBeDisabled();
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <FieldValidation />
        <FieldsetAddress />
      </>,
    );
    expect(screen.getByRole('textbox', { name: /Work email/ })).toHaveAccessibleDescription('Enter a valid work email.');
    await expectNoAxeViolations();
  });
});
