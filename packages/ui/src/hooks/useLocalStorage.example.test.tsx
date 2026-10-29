import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import StorageExample from './examples/useLocalStorageExample';

it('demonstrates shared density, removing a saved value and session updates accessibly', async () => {
  sessionStorage.clear();
  const user = userEvent.setup();
  render(<StorageExample />);
  await user.click(screen.getByRole('button', { name: 'Use compact density' }));
  expect(screen.getByLabelText('Shared density')).toHaveTextContent('compact');
  await user.click(screen.getByRole('button', { name: 'Read saved density' }));
  expect(screen.getByLabelText('Saved density')).toHaveTextContent('compact');
  await user.click(screen.getByRole('button', { name: 'Reset density' }));
  expect(screen.getByLabelText('Shared density')).toHaveTextContent('comfortable');
  await user.click(screen.getByRole('button', { name: 'Add session visit' }));
  expect(screen.getByLabelText('Session visits')).toHaveTextContent('1');
  await user.click(screen.getByRole('button', { name: 'Reset session visits' }));
  expect(screen.getByLabelText('Session visits')).toHaveTextContent('0');
  await expectNoAxeViolations();
});
