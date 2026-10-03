import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Blockquote } from './Blockquote';
import BlockquoteProse from './examples/BlockquoteProse';
import BlockquoteTestimonial from './examples/BlockquoteTestimonial';

describe('Blockquote', () => {
  it('renders a figure with the quote and a cite caption', () => {
    render(
      <Blockquote source="Ada" sourceDetail="Engineer">
        Ship small.
      </Blockquote>,
    );
    const figure = screen.getByRole('figure');
    expect(figure.querySelector('blockquote')).toHaveTextContent('Ship small.');
    expect(figure.querySelector('figcaption cite')).toHaveTextContent('Ada');
    expect(figure).toHaveTextContent('Engineer');
  });

  it('Tab reaches the source link when cite is set, and the blockquote carries cite', async () => {
    const user = userEvent.setup();
    render(<BlockquoteProse />);
    await user.tab();
    const link = screen.getByRole('link', { name: 'Incident review' });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute('href', 'https://example.com/reviews/q3');
    expect(document.querySelector('blockquote')).toHaveAttribute('cite', 'https://example.com/reviews/q3');
  });

  it('variants: the quote mark is decorative', () => {
    const { container } = render(<Blockquote variant="card">Hi</Blockquote>);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <BlockquoteProse />
        <BlockquoteTestimonial />
      </>,
    );
    expect(screen.getAllByRole('figure')).toHaveLength(3);
    await expectNoAxeViolations();
  });
});
