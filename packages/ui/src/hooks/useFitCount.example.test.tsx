import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import FitCountExample from './examples/useFitCountExample';

/** A layout where the container is 10px wide and every measured chip is 100px wide, so no tag fits. */
function measureNothingFits() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private readonly callback: () => void) {}
      observe() {
        this.callback();
      }
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(10);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 100,
    bottom: 20,
    width: 100,
    height: 20,
    toJSON: () => ({}),
  });
}

describe('useFitCount example', () => {
  beforeEach(measureNothingFits);
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(['dark', 'light', 'high_contrast'])('has no axe violations when no tag fits in %s', async (theme) => {
    document.documentElement.className = theme;
    const view = render(<FitCountExample />);
    expect(screen.getByText('Visible items: 0 of 6')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Tags' })).toContainElement(screen.getByRole('listitem'));
    await expectNoAxeViolations(view.container);
  });
});
