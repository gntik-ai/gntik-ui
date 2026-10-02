import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Card, CardAction, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import CardWithHeader from './examples/CardWithHeader';
import CardVariants from './examples/CardVariants';

describe('Card', () => {
  it('renders the parts with a heading, description and actions', () => {
    render(<CardWithHeader />);
    expect(screen.getByRole('heading', { level: 3, name: 'Retry policy' })).toBeInTheDocument();
    expect(screen.getByText('Applied to every deployment in this project.')).toHaveClass('text-muted-foreground');
    expect(screen.getByRole('button', { name: 'Edit' }).parentElement).toHaveClass('col-start-2');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('supports variants, heading level, divided header and className merge', () => {
    render(
      <Card variant="well" data-testid="card" className="p-2">
        <CardHeader divided data-testid="header">
          <CardTitle as="h2">Usage</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
          <CardAction>…</CardAction>
        </CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-secondary/50', 'p-2');
    expect(card).not.toHaveClass('shadow-sm');
    expect(screen.getByTestId('header')).toHaveClass('border-b');
    expect(screen.getByRole('heading', { level: 2, name: 'Usage' })).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toHaveClass('border-t', 'justify-end');
  });

  it('examples have no axe violations', async () => {
    render(<><CardWithHeader /><CardVariants /></>);
    await expectNoAxeViolations();
  });
});
