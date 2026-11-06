import { render, screen } from '@testing-library/react';
import { ChatComposer } from './ChatComposer';

it('attaches the picker outside the composer and removes it when the action is hidden', () => {
  const { container, rerender } = render(<ChatComposer onSubmit={() => {}} onAttach={() => {}} accept=".json" />);
  expect(container.querySelector('input[type=file]')).toBeNull();
  expect(document.querySelector('input[type=file]')).toHaveAttribute('accept', '.json');
  expect(document.querySelector('input[type=file]')).toHaveAttribute('multiple');
  expect(screen.getByRole('button', { name: 'Attach files' })).toBeEnabled();
  rerender(<ChatComposer onSubmit={() => {}} />);
  expect(document.querySelector('input[type=file]')).toBeNull();
  rerender(<ChatComposer onSubmit={() => {}} onAttach={() => {}} readOnly />);
  expect(document.querySelector('input[type=file]')).toBeNull();
});
