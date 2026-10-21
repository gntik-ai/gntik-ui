import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import Locale from './examples/Locale';

it('gives each agenda locale example a distinct landmark name', async () => {
  const { container } = render(<Locale />);
  expect(screen.getByRole('region', { name: 'Agenda (en-US)' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Agenda (es-ES)' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Agenda (en-US, h23)' })).toBeInTheDocument();
  await expectNoAxeViolations(container);
});
