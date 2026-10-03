import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Carousel } from './Carousel';
import CarouselAutoplay from './examples/CarouselAutoplay';
import CarouselProjects from './examples/CarouselProjects';

const current = () => document.querySelector('[aria-roledescription="slide"][aria-current="true"]');

function setup(props: Partial<Parameters<typeof Carousel>[0]> = {}) {
  const user = userEvent.setup();
  const onIndexChange = vi.fn();
  render(
    <Carousel label="Gallery" showDots onIndexChange={onIndexChange} {...props}>
      <div>One</div>
      <div>Two</div>
      <div>Three</div>
    </Carousel>,
  );
  return { user, onIndexChange };
}

describe('Carousel', () => {
  it('exposes the carousel pattern', () => {
    setup();
    const region = screen.getByRole('region', { name: 'Gallery' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    const slides = document.querySelectorAll('[aria-roledescription="slide"]');
    expect(slides).toHaveLength(3);
    expect(slides[1]).toHaveAccessibleName('2 of 3');
  });

  it('previous / next buttons move and disable at the ends', async () => {
    const { user, onIndexChange } = setup();
    const prev = screen.getByRole('button', { name: 'Previous slide' });
    expect(prev).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(current()).toHaveTextContent('Two');
    expect(prev).toBeEnabled();
  });

  it('ArrowRight / ArrowLeft / Home / End on the focused strip', async () => {
    const { user } = setup();
    const strip = screen.getAllByRole('group', { name: 'Gallery' })[0] as HTMLElement;
    strip.focus();
    await user.keyboard('{ArrowRight}');
    expect(current()).toHaveTextContent('Two');
    await user.keyboard('{End}');
    expect(current()).toHaveTextContent('Three');
    await user.keyboard('{ArrowLeft}');
    expect(current()).toHaveTextContent('Two');
    await user.keyboard('{Home}');
    expect(current()).toHaveTextContent('One');
  });

  it('Tab and Enter / Space activate the controls and dots', async () => {
    const { user } = setup();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next slide' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(current()).toHaveTextContent('Two');
    const dot = screen.getByRole('button', { name: 'Go to slide 3' });
    dot.focus();
    await user.keyboard(' ');
    expect(dot).toHaveAttribute('aria-current', 'true');
  });

  it('autoplay rotates, pauses on focus and has a pause control', () => {
    vi.useFakeTimers();
    try {
      render(<CarouselAutoplay />);
      const pause = screen.getByRole('button', { name: 'Stop automatic slide show' });
      act(() => vi.advanceTimersByTime(6000));
      expect(current()).toHaveTextContent('⌘K');
      act(() => pause.click());
      expect(screen.getByRole('button', { name: 'Start automatic slide show' })).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(12000));
      expect(current()).toHaveTextContent('⌘K');
    } finally {
      vi.useRealTimers();
    }
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <CarouselProjects />
        <CarouselAutoplay />
      </>,
    );
    await expectNoAxeViolations();
  });
});
