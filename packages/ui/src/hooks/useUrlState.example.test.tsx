import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlStateExample from './examples/useUrlStateExample';

it('demonstrates typed query and push page state on an isolated memory adapter', async () => {
  const replace = vi.spyOn(history, 'replaceState');
  const push = vi.spyOn(history, 'pushState');
  render(<UrlStateExample />);
  await userEvent.type(screen.getByRole('textbox', { name: 'Search resources' }), 'api');
  expect(screen.getByLabelText('Shared query')).toHaveTextContent('api');
  await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByLabelText('Current page')).toHaveTextContent('2');
  await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('textbox', { name: 'Search resources' })).toHaveValue('');
  expect(replace).not.toHaveBeenCalled();
  expect(push).not.toHaveBeenCalled();
});
