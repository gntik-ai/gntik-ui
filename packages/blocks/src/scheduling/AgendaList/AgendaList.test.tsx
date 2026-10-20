import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { AgendaList } from './AgendaList';

describe('AgendaList', () => {
  it('groups the next seven days by day', async () => {
    const { container } = render(<AgendaList />);
    expect(screen.getByRole('heading', { name: 'Today · Wednesday, April 15' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tomorrow · Thursday, April 16' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'Today · Wednesday, April 15' })).getAllByRole('listitem'),
    ).toHaveLength(9);
    expect(screen.queryByRole('heading', { name: /April 22/ })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('reports clicks and shows the empty state', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const { unmount } = render(<AgendaList onEventClick={onEventClick} />);
    await user.click(screen.getByRole('button', { name: /Checkout hotfix/ }));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Checkout hotfix' }));
    unmount();
    render(<AgendaList events={[]} />);
    expect(screen.getByRole('heading', { name: 'Nothing scheduled' })).toBeInTheDocument();
  });
});

it.each([
  ['en-US', undefined, '9:30 AM–10:00 AM'],
  ['es-ES', undefined, '09:30–10:00'],
  ['en-US', 'h23', '09:30–10:00'],
] as const)('formats agenda ranges for %s with override %s', (locale, hourCycle, expected) => {
  render(
    <I18nProvider locale={locale}>
      <AgendaList
        hourCycle={hourCycle}
        events={[
          {
            id: 'clock',
            title: 'Review',
            kind: 'task',
            start: new Date(2026, 3, 15, 9, 30),
            end: new Date(2026, 3, 15, 10),
          },
        ]}
      />
    </I18nProvider>,
  );
  expect(screen.getByText(expected)).toBeInTheDocument();
});
