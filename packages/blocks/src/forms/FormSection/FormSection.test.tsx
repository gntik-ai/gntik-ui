import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Field, FieldLabel, Input } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { FormSection } from './FormSection';

describe('FormSection', () => {
  it('renders the default section as a named region', async () => {
    const { container } = render(<FormSection />);
    expect(screen.getByRole('region', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByLabelText('Project name')).toHaveValue('billing-dashboard');
    await expectNoAxeViolations(container);
  });

  it('renders custom fields and actions', async () => {
    const onSave = vi.fn();
    render(
      <FormSection title="Profile" description="How you appear to others." actions={<Button onClick={onSave}>Save</Button>}>
        <Field>
          <FieldLabel>Display name</FieldLabel>
          <Input />
        </Field>
      </FormSection>,
    );
    await userEvent.type(screen.getByLabelText('Display name'), 'Avery');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Display name')).toHaveValue('Avery');
  });
});
