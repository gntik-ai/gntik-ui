import { fireEvent, render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../test/a11y';
import HotkeysExample from './examples/useHotkeysExample';

it.each(['dark', 'light', 'high_contrast'])('demonstrates shortcuts and registry accessibly in %s', async (theme) => {
  document.documentElement.className = theme;
  const view = render(<HotkeysExample />);
  fireEvent.keyDown(document.body, { key: '/' });
  const input = screen.getByRole('textbox', { name: 'Search' });
  expect(input).toHaveFocus();
  input.blur();
  fireEvent.keyDown(document.body, { key: 'g' });
  fireEvent.keyDown(document.body, { key: 'd' });
  expect(screen.getByRole('status')).toHaveTextContent('GD');
  expect(screen.getByText('Open the command palette')).toBeInTheDocument();
  await expectNoAxeViolations(view.container);
});
