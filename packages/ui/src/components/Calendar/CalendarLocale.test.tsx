import { render, screen, within } from '@testing-library/react';
import CalendarLocale from './examples/CalendarLocale';
import CalendarViews from './examples/CalendarViews';

it('locale examples leave the Calendar views example independently addressable', () => {
  render(
    <>
      <CalendarLocale />
      <CalendarViews />
    </>,
  );
  const views = screen.getAllByRole('group', { name: 'Calendar' });
  expect(within(views[0]!).getByRole('grid')).toHaveAccessibleName('March 2026');
  expect(screen.getByRole('group', { name: 'Calendar (en-US)' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Calendario (es-ES)' })).toBeInTheDocument();
});
