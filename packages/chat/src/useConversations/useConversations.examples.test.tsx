import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { TooltipProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../test/a11y';
import UseConversationsEcho from './examples/UseConversationsEcho';

it.each(['dark', 'light', 'high_contrast'])(
  'restores separate echo histories and is axe clean in %s',
  async (theme) => {
    document.documentElement.className = theme;
    render(
      <StrictMode>
        <TooltipProvider>
          <UseConversationsEcho />
        </TooltipProvider>
      </StrictMode>,
    );
    const messages = within(screen.getByRole('region', { name: 'Messages' }));
    const send = async (text: string) => {
      fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: text } });
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), { key: 'Enter' });
      await waitFor(() => expect(messages.getAllByText(text)).toHaveLength(2));
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Stop generating' })).not.toBeInTheDocument());
    };
    await send('First conversation message');
    fireEvent.click(screen.getByRole('button', { name: 'Second chat' }));
    expect(messages.queryByText('First conversation message')).not.toBeInTheDocument();
    await send('Second conversation message');
    fireEvent.click(screen.getByRole('button', { name: 'First chat' }));
    expect(messages.getAllByText('First conversation message')).toHaveLength(2);
    expect(messages.queryByText('Second conversation message')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Second chat' }));
    expect(messages.getAllByText('Second conversation message')).toHaveLength(2);
    expect(messages.queryByText('First conversation message')).not.toBeInTheDocument();
    await expectNoAxeViolations();
  },
);
