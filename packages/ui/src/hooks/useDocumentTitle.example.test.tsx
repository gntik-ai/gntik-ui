import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentTitleExample from './examples/useDocumentTitleExample';

it('writes the title while editing and restores it afterwards', async () => {
  const user = userEvent.setup();
  document.title = 'Catalog';
  render(<DocumentTitleExample />);
  await user.click(screen.getByRole('button', { name: 'Edit fn-42' }));
  expect(document.title).toBe('Edit fn-42');
  await user.click(screen.getByRole('button', { name: 'Stop editing' }));
  expect(document.title).toBe('Catalog');
});
