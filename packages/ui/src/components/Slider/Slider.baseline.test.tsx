import { render } from '@testing-library/react';
import { Slider } from './Slider';

// Recorded from immutable base d919957e99357a78c4f441d78dcb6211ce979e24.
it('preserves the base Slider DOM and generated ids without marks', () => {
  const { container, rerender } = render(<Slider label="Volume" showValue defaultValue={50} />);
  expect(container.innerHTML).toMatchSnapshot();
  const baseline = container.innerHTML;
  rerender(<Slider label="Volume" showValue defaultValue={50} marks={[]} restrictToMarks />);
  expect(container.innerHTML).toBe(baseline);
});
