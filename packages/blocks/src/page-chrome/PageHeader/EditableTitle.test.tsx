import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import EditableTitle from './examples/EditableTitle';

it.each(['dark', 'light', 'high_contrast'])(
  'the editable PageHeader title keeps its name and is axe clean in %s',
  async (theme) => {
    const user = userEvent.setup();
    const { container } = render(
      <div data-theme={theme}>
        <EditableTitle />
      </div>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Support agent' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Support agent' }));
    const input = screen.getByRole('textbox', { name: 'Agent name' });
    expect(input).toHaveFocus();
    await expectNoAxeViolations(container);
    await user.clear(input);
    await user.type(input, 'Billing agent{Enter}');
    expect(screen.getByRole('heading', { level: 1, name: 'Billing agent' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Billing agent' })).toHaveFocus();
  },
);
