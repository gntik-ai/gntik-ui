import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TooltipProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../test/a11y';
import UseChatEcho from './examples/UseChatEcho';

it.each(['dark', 'light', 'high_contrast'])(
  'runs the live runtime example with keyboard submission and axe in %s',
  async (theme) => {
    document.documentElement.className = theme;
    render(
      <TooltipProvider>
        <UseChatEcho />
      </TooltipProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: '**hello**' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('hello', { selector: 'strong' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument());
    await expectNoAxeViolations();
  },
);
