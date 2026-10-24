import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ContactPage from './Page';
import { offices } from './data';

const validValues = {
  name: 'Ada Example',
  email: 'ada@example.com',
  company: 'Example Ltd',
  topic: 'sales' as const,
  message: 'We would like a demo for 40 seats.',
};

describe('ContactPage', () => {
  it('clears the alert before retrying, then focuses success and resets without an error', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('502 Bad Gateway'))
      .mockImplementationOnce(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        return Promise.resolve();
      });
    render(<ContactPage onSubmit={onSubmit} defaultValues={validValues} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('heading', { name: 'Message sent' })).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Send another message' }));
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('Ada Example');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each(['dark', 'light', 'high_contrast'])(
    'keeps the form and safely announces a failed send (%s)',
    { timeout: 15000 },
    async (theme) => {
      document.documentElement.className = theme;
      const onSubmit = vi.fn().mockRejectedValue(new Error('502 Bad Gateway'));
      render(<ContactPage onSubmit={onSubmit} defaultValues={{ topic: 'sales' }} />);
      await userEvent.type(screen.getByRole('textbox', { name: /^Name/ }), 'Ada Example');
      await userEvent.type(screen.getByRole('textbox', { name: /Work email/ }), 'ada@example.com');
      await userEvent.type(screen.getByRole('textbox', { name: /Company/ }), 'Example Ltd');
      await userEvent.type(screen.getByRole('textbox', { name: /Message/ }), 'We would like a demo for 40 seats.');
      const send = screen.getByRole('button', { name: 'Send message' });
      await userEvent.click(send);

      expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't send your message. Please try again.");
      expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('Ada Example');
      expect(screen.getByRole('textbox', { name: /Work email/ })).toHaveValue('ada@example.com');
      expect(screen.getByRole('textbox', { name: /Company/ })).toHaveValue('Example Ltd');
      expect(screen.getByRole('combobox', { name: /Topic/ })).toHaveTextContent('Sales');
      expect(screen.getByRole('textbox', { name: /Message/ })).toHaveValue('We would like a demo for 40 seats.');
      expect(screen.queryByRole('heading', { name: 'Message sent' })).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByText('502 Bad Gateway')).not.toBeInTheDocument();
      expect(send).toBeEnabled();
      expect(send).not.toHaveAttribute('aria-busy', 'true');
      expect(send).toHaveFocus();
      await expectNoAxeViolations();
    },
  );

  it('uses the visitor-facing message override without exposing the rejection', async () => {
    render(
      <ContactPage
        defaultValues={validValues}
        onSubmit={vi.fn().mockRejectedValue(new Error('502 Bad Gateway'))}
        submitErrorMessage={<span>Sending is paused. Email us instead.</span>}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sending is paused. Email us instead.');
    expect(screen.queryByText("We couldn't send your message. Please try again.")).not.toBeInTheDocument();
    expect(screen.queryByText('502 Bad Gateway')).not.toBeInTheDocument();
  });

  it('uses the Spanish catalog for send failures', async () => {
    render(
      <I18nProvider locale="es">
        <ContactPage defaultValues={validValues} onSubmit={vi.fn().mockRejectedValue(new Error('502 Bad Gateway'))} />
      </I18nProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hemos podido enviar tu mensaje. Inténtalo de nuevo.',
    );
  });

  it('does not call onSubmit or show a send-failure alert for invalid values', async () => {
    const onSubmit = vi.fn();
    render(<ContactPage onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getAllByText('Enter your name.').length).toBeGreaterThan(0);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows no alert after a successful send', async () => {
    render(<ContactPage defaultValues={validValues} onSubmit={vi.fn().mockResolvedValue(undefined)} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('heading', { name: 'Message sent' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the form and office cards', { timeout: 15000 }, async () => {
    render(<ContactPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Talk to us' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
    const officesRegion = screen.getByRole('region', { name: 'Offices' });
    expect(within(officesRegion).getAllByRole('heading', { level: 3 })).toHaveLength(offices.length);
    await expectNoAxeViolations();
  });

  it('validates, then sends and shows the success state', { timeout: 15000 }, async () => {
    const onSubmit = vi.fn();
    render(<ContactPage onSubmit={onSubmit} defaultValues={{ topic: 'sales' }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText('Enter your name.').length).toBeGreaterThan(0);
    await userEvent.type(screen.getByRole('textbox', { name: /^Name/ }), 'Ada Example');
    await userEvent.type(screen.getByRole('textbox', { name: /Work email/ }), 'ada@example.com');
    await userEvent.type(screen.getByRole('textbox', { name: /Message/ }), 'We would like a demo for 40 seats.');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ada Example', topic: 'sales' }));
    expect(await screen.findByRole('heading', { name: 'Message sent' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveFocus();
    await expectNoAxeViolations();
  });
});
