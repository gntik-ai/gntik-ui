import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import MatchText from './examples/MatchText';

it.each(['dark', 'light', 'high_contrast'])(
  'demonstrates filtering and original highlights with semantic axe checks in %s',
  async (theme) => {
    const previous = document.documentElement.className;
    document.documentElement.className = theme === 'light' ? '' : theme;
    try {
      const user = userEvent.setup();
      render(<MatchText />);
      expect(screen.getByRole('listitem')).toHaveTextContent('Función');
      expect(document.querySelector('mark')?.textContent).toBe('Función');
      await expectNoAxeViolations();
      const input = screen.getByRole('textbox', { name: 'Search names without accents' });
      await user.clear(input);
      await user.type(input, 'stan');
      expect(document.querySelector('mark')?.textContent).toBe('stan');
      await expectNoAxeViolations();
    } finally {
      cleanup();
      document.documentElement.className = previous;
    }
  },
);
