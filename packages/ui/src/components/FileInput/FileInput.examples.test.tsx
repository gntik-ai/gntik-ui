import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import FileInputServiceAccount from './examples/FileInputServiceAccount';
import FileInputCertificate from './examples/FileInputCertificate';
import FileInputMultiple from './examples/FileInputMultiple';
import FileInputStates from './examples/FileInputStates';
import FileInputTrigger from './examples/FileInputTrigger';
import FileInputDialogHook from './examples/FileInputDialogHook';
import FileInputReset from './examples/FileInputReset';

it.each(['dark', 'light', 'high_contrast'])(
  'examples are axe clean in %s, including a modal trigger',
  async (theme) => {
    document.documentElement.className = theme;
    for (const Example of [
      FileInputServiceAccount,
      FileInputCertificate,
      FileInputMultiple,
      FileInputStates,
      FileInputTrigger,
      FileInputDialogHook,
      FileInputReset,
    ]) {
      const view = render(<Example />);
      await expectNoAxeViolations();
      if (Example === FileInputTrigger) {
        await userEvent.click(screen.getByRole('button', { name: 'Import in a dialog' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await expectNoAxeViolations();
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        await userEvent.click(screen.getByRole('button', { name: 'Import in a popover' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await expectNoAxeViolations();
      }
      view.unmount();
    }
  },
);
