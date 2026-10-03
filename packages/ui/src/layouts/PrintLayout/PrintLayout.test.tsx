import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import PrintLayoutInvoice from './examples/PrintLayoutInvoice';
import { PageBreak, PrintLayout } from './PrintLayout';

describe('PrintLayout', () => {
  it('renders a labelled sheet inside main with header and footer', () => {
    render(<PrintLayoutInvoice />);
    const sheet = screen.getByRole('article', { name: 'Invoice INV-2026-0042' });
    expect(screen.getByRole('main')).toContainElement(sheet);
    expect(sheet).toHaveClass('bg-card', 'text-card-foreground', 'shadow-sm', 'print:shadow-none', 'print:border-0');
    expect(screen.getByRole('heading', { level: 1, name: 'Invoice' })).toBeInTheDocument();
    expect(screen.getByText(/Thank you for your business/)).toBeInTheDocument();
  });

  it('size and margin set the page and the @page rule', () => {
    const { container, rerender } = render(<PrintLayout size="letter" margin="wide">Body</PrintLayout>);
    expect(screen.getByRole('article')).toHaveClass('w-[8.5in]', 'p-[28mm]');
    expect(container.querySelector('style')).toHaveTextContent('@page { size: letter; margin: 28mm; }');
    rerender(<PrintLayout pageRule={false}>Body</PrintLayout>);
    expect(screen.getByRole('article')).toHaveClass('w-[210mm]', 'min-h-[297mm]');
    expect(container.querySelector('style')).toBeNull();
  });

  it('the outer frame fills its container and drops chrome in print', () => {
    const { container, rerender } = render(<PrintLayout>Body</PrintLayout>);
    expect(container.firstElementChild).toHaveClass('h-full', 'print:p-0', 'print:bg-transparent');
    rerender(<PrintLayout fullScreen>Body</PrintLayout>);
    expect(container.firstElementChild).toHaveClass('h-dvh');
  });

  it('PageBreak breaks the printed page and is hidden from assistive tech', () => {
    const { container } = render(<PageBreak />);
    const el = container.firstElementChild;
    expect(el).toHaveClass('break-after-page');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('static: only the skip link is focusable, and it moves focus to the document', async () => {
    const user = userEvent.setup();
    render(<PrintLayout>Body</PrintLayout>);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to document' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('the example has no axe violations', async () => {
    render(<PrintLayoutInvoice />);
    await expectNoAxeViolations();
  });
});
