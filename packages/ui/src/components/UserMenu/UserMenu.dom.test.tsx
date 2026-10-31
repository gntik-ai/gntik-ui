import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Eye } from 'lucide-react';
import { MoreMenu } from '../Menu';
import { UserMenu } from './UserMenu';

// Captured at source SHA 05d05b8, before replacing UserMenu's private link implementation.
function stableMarkup(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  return clone.outerHTML;
}

it('preserves UserMenu href DOM, including the enabled href plus disabled behavior', async () => {
  const user = userEvent.setup();
  render(
    <UserMenu
      user={{ name: 'Sam Patel' }}
      showTheme={false}
      items={[{ label: 'Open run', href: '/runs/42', icon: Eye, shortcut: '⌘O', destructive: true, disabled: true }]}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Account menu for Sam Patel' }));
  expect(stableMarkup(await screen.findByRole('menuitem', { name: 'Open run' }))).toMatchSnapshot();
});

it('preserves MoreMenu action DOM without href', async () => {
  const user = userEvent.setup();
  render(<MoreMenu items={[{ label: 'Restart', icon: Eye, shortcut: '⌘R', destructive: true, disabled: true }]} />);
  await user.click(screen.getByRole('button', { name: 'More actions' }));
  expect(stableMarkup(await screen.findByRole('menuitem', { name: 'Restart' }))).toMatchSnapshot();
});
