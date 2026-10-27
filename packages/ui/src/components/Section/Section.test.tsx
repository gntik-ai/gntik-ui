import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Section } from './Section';
import SectionSettings from './examples/SectionSettings';
import SectionVariants from './examples/SectionVariants';

describe('Section', () => {
  it.each([
    ['none', false, 'p-0', 'mb-3', 'gap-4'],
    ['sm', false, 'p-4', 'mb-3', 'gap-3'],
    ['md', false, 'p-5', 'mb-4', 'gap-4'],
    ['lg', false, 'p-6 sm:p-8', 'mb-5', 'gap-5'],
    [
      'none',
      true,
      'p-0',
      'mb-3 border-b border-border pb-3',
      'gap-0 divide-y divide-border *:py-4 *:first:pt-0 *:last:pb-0',
    ],
    [
      'sm',
      true,
      'p-4',
      'mb-3 border-b border-border pb-3',
      'gap-0 divide-y divide-border *:py-4 *:first:pt-0 *:last:pb-0',
    ],
    [
      'md',
      true,
      'p-5',
      'mb-4 border-b border-border pb-4',
      'gap-0 divide-y divide-border *:py-4 *:first:pt-0 *:last:pb-0',
    ],
    [
      'lg',
      true,
      'p-6 sm:p-8',
      'mb-5 border-b border-border pb-5',
      'gap-0 divide-y divide-border *:py-4 *:first:pt-0 *:last:pb-0',
    ],
  ] as const)('keeps exact scalar output for padding %s, divided %s', (padding, divided, root, header, body) => {
    render(
      <Section title="Title" padding={padding} divided={divided}>
        Body
      </Section>,
    );
    expect(screen.getByRole('region').className).toBe(`min-w-0 text-foreground ${root}`);
    expect(screen.getByRole('heading').parentElement?.className).toBe(
      `grid grid-cols-[1fr_auto] items-start gap-x-4 ${header}`,
    );
    expect(screen.getByText('Body').className).toBe(`flex min-w-0 flex-col ${body}`);
  });

  it.each([false, true])('maps responsive padding across every slot, divided %s', (divided) => {
    render(
      <Section title="Title" padding={{ base: 'sm', md: 'lg' }} divided={divided}>
        Body
      </Section>,
    );
    expect(screen.getByRole('region')).toHaveClass('p-4', 'md:p-8');
    expect(screen.getByRole('heading').parentElement).toHaveClass('mb-3', 'md:mb-5');
    expect(screen.getByText('Body')).toHaveClass('gap-3', 'md:gap-5');
    if (divided) expect(screen.getByRole('heading').parentElement).toHaveClass('pb-3', 'md:pb-5', 'border-b');
    else expect(screen.getByRole('heading').parentElement).not.toHaveClass('pb-3');
  });

  it('lets explicit sm padding replace the sm class from base lg', () => {
    render(
      <Section title="Title" padding={{ sm: 'sm', base: 'lg', '2xl': 'md' }}>
        Body
      </Section>,
    );
    expect(screen.getByRole('region')).toHaveClass('p-6', 'sm:p-4', '2xl:p-5');
    expect(screen.getByRole('region')).not.toHaveClass('sm:p-8');
    expect(screen.getByRole('heading').parentElement).toHaveClass('mb-5', 'sm:mb-3', '2xl:mb-4');
    expect(screen.getByText('Body')).toHaveClass('gap-5', 'sm:gap-3', '2xl:gap-4');
  });

  it('is a region named by its title and described by its description', () => {
    render(<SectionSettings />);
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveAccessibleDescription('Choose what reaches your inbox.');
    expect(screen.getByRole('heading', { level: 2, name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' }).parentElement).toHaveClass('col-start-2');
    expect(region).toHaveClass('bg-card', 'p-5');
  });

  it('divided draws rules under the header and between children', () => {
    render(
      <Section divided title="Members" data-testid="s" bodyClassName="extra">
        <div>One</div>
        <div>Two</div>
      </Section>,
    );
    expect(screen.getByRole('heading', { name: 'Members' }).parentElement).toHaveClass('border-b');
    const body = screen.getByText('One').parentElement;
    expect(body).toHaveClass('divide-y', 'divide-border', 'extra');
  });

  it('renders without a header; variants and padding map to classes', () => {
    render(
      <Section variant="muted" padding="lg" data-testid="s">
        Body
      </Section>,
    );
    const s = screen.getByTestId('s');
    expect(s.tagName).toBe('SECTION');
    expect(s).not.toHaveAttribute('aria-labelledby');
    expect(s).toHaveClass('bg-secondary/50', 'p-6');
    expect(s.querySelector('.grid')).toBeNull();
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <SectionSettings />
        <SectionVariants />
      </>,
    );
    await expectNoAxeViolations();
  });
});
