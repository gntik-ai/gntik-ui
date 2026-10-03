import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Field, FieldLabel, Input } from '@gntik-ai/ui';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { ValidationSummary, type ValidationIssue } from './ValidationSummary';

function Demo() {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);
  const errors: ValidationIssue[] = count > 0 && !name ? [{ fieldId: 'project-name', label: 'Project name', message: 'Enter a project name.' }] : [];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setCount((c) => c + 1);
      }}
    >
      <ValidationSummary errors={errors} submitCount={count} />
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input id="project-name" value={name} onValueChange={setName} />
      </Field>
      <Button type="submit">Create</Button>
    </form>
  );
}

describe('ValidationSummary', () => {
  it('renders the default issues', async () => {
    const { container } = render(<ValidationSummary />);
    expect(screen.getByRole('region', { name: 'There are 3 problems with this form' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('takes focus on submit and links to the field', async () => {
    render(<Demo />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByRole('region', { name: 'There is 1 problem with this form' })).toHaveFocus();
    await userEvent.click(screen.getByRole('link', { name: /Enter a project name/ }));
    expect(screen.getByLabelText('Project name')).toHaveFocus();
  });
});
