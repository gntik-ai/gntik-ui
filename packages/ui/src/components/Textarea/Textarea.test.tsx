import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { Textarea } from './Textarea';
import TextareaAutosize from './examples/TextareaAutosize';
import TextareaCounter from './examples/TextareaCounter';

describe('Textarea', () => {
  it('takes focus with Tab and leaves with Tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Textarea aria-label="Note" />
        <button type="button">After</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Note' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('inserts a new line on Enter instead of submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const onValueChange = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <Textarea aria-label="Note" onValueChange={onValueChange} />
      </form>,
    );
    const ta = screen.getByRole('textbox', { name: 'Note' });
    expect(ta.tagName).toBe('TEXTAREA');
    await user.click(ta);
    await user.keyboard('one{Enter}two');
    expect(ta).toHaveValue('one\ntwo');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith('one\ntwo');
  });

  it('is labelled and described by its Field, focuses from the label and reflects invalid', async () => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel>Description</FieldLabel>
        <Textarea />
        <FieldDescription>Shown on the project page.</FieldDescription>
        <FieldError match>Too long.</FieldError>
      </Field>,
    );
    await user.click(screen.getByText('Description'));
    const ta = screen.getByRole('textbox', { name: 'Description' });
    expect(ta).toHaveFocus();
    expect(ta).toHaveAccessibleDescription(/Shown on the project page\./);
    expect(ta).toHaveAccessibleDescription(/Too long\./);
    expect(ta).toHaveAttribute('data-invalid');
  });

  it('forwards the ref, applies autosize and rows', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <>
        <Textarea ref={ref} aria-label="Fixed" rows={6} />
        <Textarea aria-label="Auto" autosize />
      </>,
    );
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Fixed' }));
    expect(ref.current).toHaveAttribute('rows', '6');
    expect(screen.getByRole('textbox', { name: 'Auto' })).toHaveClass('field-sizing-content');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <TextareaCounter />
        <TextareaAutosize />
      </>,
    );
    await expectNoAxeViolations();
  });
});
