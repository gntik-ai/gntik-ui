import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import HotkeysExample from './examples/useHotkeysExample';
import RegisteredHotkeysExample from './examples/useRegisteredHotkeysExample';

afterEach(cleanup);

it('leaves the g d shortcut of the Hotkeys example working when both examples are mounted together', () => {
  render(
    <>
      <HotkeysExample />
      <RegisteredHotkeysExample />
    </>,
  );
  fireEvent.keyDown(document.body, { key: 'g' });
  fireEvent.keyDown(document.body, { key: 'd' });
  expect(screen.getByRole('status')).toHaveTextContent('GD');
});
