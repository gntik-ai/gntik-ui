import { fireEvent, render, screen } from '@testing-library/react';
import { Outline } from './Outline';

it('navigates without smooth scrolling under the app motion scope', () => {
  document.documentElement.dataset.motion = 'reduce';
  const scroll = vi.fn();
  render(
    <>
      <Outline items={[{ id: 'section', label: 'Section' }]} />
      <h2 id="section">Section</h2>
    </>,
  );
  screen.getByRole('heading', { name: 'Section' }).scrollIntoView = scroll;
  try {
    fireEvent.click(screen.getByRole('link', { name: 'Section' }));
    expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
  } finally {
    document.documentElement.removeAttribute('data-motion');
  }
});
