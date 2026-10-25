import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Heading, Text } from './Text';
import TextRoles from './examples/TextRoles';
import TypographyRoles from './examples/TypographyRoles';
import TextTruncate from './examples/TextTruncate';

describe('Text', () => {
  it.each(['body', 'label', 'supporting', 'caption', 'display'] as const)(
    'renders the %s role with its tone',
    (variant) => {
      render(
        <Text variant={variant} tone="primary">
          Role
        </Text>,
      );
      const element = screen.getByText('Role');
      expect(element).toHaveClass(`text-${variant}`, 'text-primary-text');
      expect(element.className).not.toMatch(/text-\[|leading-|tracking-|font-(?:medium|semibold|bold)/);
    },
  );
  it('keeps code relative to its surrounding text', () => {
    render(<Text variant="code">Code</Text>);
    expect(screen.getByText('Code')).toHaveClass('text-[0.92em]');
  });
  it('renders a body paragraph by default', () => {
    render(<Text>Hello</Text>);
    const p = screen.getByText('Hello');
    expect(p.tagName).toBe('P');
    expect(p).toHaveClass('text-foreground', 'text-body');
  });

  it('picks a tag and tone per variant, overridable', () => {
    render(
      <>
        <Text variant="code">npm</Text>
        <Text variant="supporting">Hint</Text>
        <Text variant="caption" tone="destructive" as="small">
          Error
        </Text>
        <Text variant="label" tone="success">
          Paid
        </Text>
      </>,
    );
    expect(screen.getByText('npm').tagName).toBe('CODE');
    expect(screen.getByText('npm')).toHaveClass('font-mono');
    expect(screen.getByText('Hint')).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Error').tagName).toBe('SMALL');
    expect(screen.getByText('Error')).toHaveClass('text-destructive-text');
    expect(screen.getByText('Paid')).toHaveClass('text-success-text', 'text-label');
  });

  it('truncates, clamps and renders through `render`', () => {
    render(
      <>
        <Text truncate>One</Text>
        <Text lineClamp={3}>Two</Text>
        <Text render={<label htmlFor="x" />} variant="label">
          Three
        </Text>
      </>,
    );
    expect(screen.getByText('One')).toHaveClass('truncate');
    expect(screen.getByText('Two')).toHaveClass('line-clamp-3');
    expect(screen.getByText('Three').tagName).toBe('LABEL');
  });
});

describe('Heading', () => {
  it.each(['display', 'xl', 'lg', 'md', 'sm', 'xs', '2xs'] as const)(
    'renders size %s through a single role',
    (size) => {
      render(<Heading size={size}>Role</Heading>);
      const element = screen.getByRole('heading', { name: 'Role' });
      expect(element).toHaveClass(size === 'display' ? 'text-display' : `text-heading-${size}`, 'text-foreground');
      expect(element.className).not.toMatch(/text-\[|leading-|tracking-|font-(?:medium|semibold|bold)/);
    },
  );
  it('level sets the tag and default size; size is independent', () => {
    render(
      <>
        <Heading level={1}>Page</Heading>
        <Heading level={4} size="display" tone="primary">
          Big h4
        </Heading>
        <Heading>Default</Heading>
      </>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Page' })).toHaveClass('text-heading-xl');
    const h4 = screen.getByRole('heading', { level: 4, name: 'Big h4' });
    expect(h4).toHaveClass('text-display', 'text-primary-text');
    expect(screen.getByRole('heading', { level: 2, name: 'Default' })).toHaveClass(
      'text-heading-lg',
      'text-foreground',
    );
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <TextRoles />
        <TextTruncate />
      </>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('truncate');
    await expectNoAxeViolations();
  });
});

describe('TypographyRoles', () => {
  it('demonstrates explicit weight and tracking when a literal size replaces a role', () => {
    render(<TypographyRoles />);
    expect(screen.getByText('Display with custom size')).toHaveClass('text-[32px]', 'font-bold', 'tracking-tight');
    expect(screen.getByText('Label with custom size')).toHaveClass('text-[12px]', 'font-medium');
    expect(screen.getByRole('heading', { name: 'Heading with custom size' })).toHaveClass(
      'text-[16px]',
      'font-semibold',
      'tracking-tight',
    );
  });

  it('has no axe violations', async () => {
    render(<TypographyRoles />);
    await expectNoAxeViolations();
  });
});
