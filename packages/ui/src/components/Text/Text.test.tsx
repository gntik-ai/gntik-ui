import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Heading, Text } from './Text';
import TextRoles from './examples/TextRoles';
import TextTruncate from './examples/TextTruncate';

describe('Text', () => {
  it('renders a body paragraph by default', () => {
    render(<Text>Hello</Text>);
    const p = screen.getByText('Hello');
    expect(p.tagName).toBe('P');
    expect(p).toHaveClass('text-foreground', 'leading-relaxed');
  });

  it('picks a tag and tone per variant, overridable', () => {
    render(
      <>
        <Text variant="code">npm</Text>
        <Text variant="supporting">Hint</Text>
        <Text variant="caption" tone="destructive" as="small">Error</Text>
        <Text variant="label" tone="success">Paid</Text>
      </>,
    );
    expect(screen.getByText('npm').tagName).toBe('CODE');
    expect(screen.getByText('npm')).toHaveClass('font-mono');
    expect(screen.getByText('Hint')).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Error').tagName).toBe('SMALL');
    expect(screen.getByText('Error')).toHaveClass('text-destructive-text');
    expect(screen.getByText('Paid')).toHaveClass('text-success-text', 'font-medium');
  });

  it('truncates, clamps and renders through `render`', () => {
    render(
      <>
        <Text truncate>One</Text>
        <Text lineClamp={3}>Two</Text>
        <Text render={<label htmlFor="x" />} variant="label">Three</Text>
      </>,
    );
    expect(screen.getByText('One')).toHaveClass('truncate');
    expect(screen.getByText('Two')).toHaveClass('line-clamp-3');
    expect(screen.getByText('Three').tagName).toBe('LABEL');
  });
});

describe('Heading', () => {
  it('level sets the tag and default size; size is independent', () => {
    render(
      <>
        <Heading level={1}>Page</Heading>
        <Heading level={4} size="display" tone="primary">Big h4</Heading>
        <Heading>Default</Heading>
      </>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Page' })).toHaveClass('text-[1.875rem]');
    const h4 = screen.getByRole('heading', { level: 4, name: 'Big h4' });
    expect(h4).toHaveClass('text-[2.875rem]', 'text-primary-text');
    expect(screen.getByRole('heading', { level: 2, name: 'Default' })).toHaveClass('text-[1.5rem]', 'text-foreground');
  });

  it('examples have no axe violations', async () => {
    render(<><TextRoles /><TextTruncate /></>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('truncate');
    await expectNoAxeViolations();
  });
});
