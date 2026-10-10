import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ErrorPanel, FirstRunEmpty } from '@gntik-ai/blocks';
import CreateWizardPage from './Page';

it('creates through an overlay of a mounted list, with step-local error and empty surfaces', async () => {
  const user = userEvent.setup();
  const onFinish = vi.fn();
  function List() {
    const [open, setOpen] = useState(false);
    return <>
      <main><h1>Projects</h1><input aria-label="Filter projects" defaultValue="Keep me" />
        <button onClick={() => setOpen(true)}>New project</button></main>
      <CreateWizardPage mode="overlay" open={open} onOpenChange={setOpen} description="Configure a project"
        onFinish={(values) => { onFinish(values); setOpen(false); }}
        stepFeedback={(step) => step === 1 ? <ErrorPanel title="Source unavailable" message="Try again" requestId="" details="" secondaryAction={null} />
          : step === 2 ? <FirstRunEmpty title="No environments" description="Create one later" actionLabel="Continue setup" secondary={null} steps={[]} /> : null}
      />
    </>;
  }
  render(<List />);
  const filter = screen.getByRole('textbox', { name: 'Filter projects' });
  const url = window.location.href;
  await user.click(screen.getByRole('button', { name: 'New project' }));
  await screen.findByRole('dialog', { name: 'New project' });
  await user.type(screen.getByRole('textbox', { name: /Project name/ }), 'orders-api');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('Source unavailable')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('No environments')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Create project' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('textbox', { name: 'Filter projects' })).toBe(filter);
  expect(filter).toHaveValue('Keep me');
  expect(window.location.href).toBe(url);
});
