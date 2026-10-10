import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import type { WizardLayoutProps } from './WizardLayout';
import { WizardLayout } from './WizardLayout';

const steps = [{ label: 'Details' }, { label: 'Review' }];

function Harness({ explicitReturn = false, ...props }: Partial<WizardLayoutProps> & { explicitReturn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={ref}>Return here</button>
    <input aria-label="Page state" defaultValue="Preserved" />
    <button onClick={() => setOpen(true)}>Open wizard</button>
    <WizardLayout mode="overlay" open={open} onOpenChange={setOpen} steps={steps} current={current}
      onStepChange={setCurrent} title="Create resource" returnFocusRef={explicitReturn ? ref : undefined} {...props}>
      <h2>{steps[current]?.label}</h2><input aria-label="Step field" />
    </WizardLayout>
  </>;
}

describe('WizardLayout overlay', () => {
  it('names a modal from its title and description without a page landmark or skip link', async () => {
    render(
      <WizardLayout mode="overlay" open title="Create resource" description="Configure a resource" steps={steps} current={0}>
        <h2>Details</h2>
      </WizardLayout>,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Create resource' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Configure a resource');
    expect(within(dialog).getByRole('button', { name: 'Exit' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(within(dialog).getByRole('navigation', { name: 'Progress' }).querySelector('[aria-current="step"]')).toHaveTextContent('Details');
    expect(within(dialog).queryByRole('main')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('link')).not.toBeInTheDocument();
  });

  it.each(['Escape', 'Exit', 'Cancel'])('closes directly with %s, restores trigger focus and preserves the sibling page and URL', async (action) => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness confirmExit={false} onExit={onExit} />);
    const page = screen.getByRole('textbox', { name: 'Page state' });
    const url = window.location.href;
    await user.type(page, ' value');
    const trigger = screen.getByRole('button', { name: 'Open wizard' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (const shift of [false, true]) {
      for (let i = 0; i < 8; i++) {
        await user.tab({ shift });
        await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
      }
    }
    if (action === 'Escape') await user.keyboard('{Escape}');
    else await user.click(screen.getByRole('button', { name: action }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Page state' })).toBe(page);
    expect(page).toHaveValue('Preserved value');
    expect(window.location.href).toBe(url);
  });

  it.each(['Escape', 'Exit'])('routes %s through confirmation; nested Escape and Stay leave the wizard open', async (action) => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness explicitReturn onExit={onExit} />);
    await user.click(screen.getByRole('button', { name: 'Open wizard' }));
    await screen.findByRole('dialog');
    const dismiss = async () => action === 'Escape' ? user.keyboard('{Escape}') : user.click(screen.getByRole('button', { name: 'Exit' }));
    await dismiss();
    await screen.findByRole('alertdialog');
    expect(onExit).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await dismiss();
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Stay' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await dismiss();
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Leave' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onExit).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Return here' })).toHaveFocus());
  });

  it.each([undefined, false, true])('outside press obeys closeOnInteractOutside=%s', async (closeOnInteractOutside) => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness closeOnInteractOutside={closeOnInteractOutside} confirmExit={false} onExit={onExit} />);
    await user.click(screen.getByRole('button', { name: 'Open wizard' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(dialog.parentElement!);
    if (closeOnInteractOutside) {
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onExit).toHaveBeenCalledTimes(1);
    } else {
      expect(dialog).toBeInTheDocument();
      expect(onExit).not.toHaveBeenCalled();
    }
  });

  it('focuses each new heading, announces it separately, and retains the controlled step after closing', async () => {
    const user = userEvent.setup();
    render(<Harness confirmExit={false} stepAnnouncement={({ position, total, label }) => `${label}: ${position}/${total}`} />);
    await user.click(screen.getByRole('button', { name: 'Open wizard' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Details' })).toHaveFocus());
    expect(await screen.findByRole('status')).toHaveTextContent('Details: 1/2');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Review' })).toHaveFocus());
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Review: 2/2'));
    expect(screen.getByRole('heading', { name: 'Review' }).contains(screen.getByRole('status'))).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Details' })).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Exit' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Open wizard' }));
    expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument();
  });

  it.each(['finishPending', 'nextLoading'] as const)('Finish is non-repeatable with a supplied pending label while %s', async (pendingProp) => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    function PendingWizard() {
      const [pending, setPending] = useState(false);
      return <WizardLayout mode="overlay" open steps={steps} current={1} title="Create resource"
        {...{ [pendingProp]: pending }} pendingLabel="Creating resource" onFinish={() => { onFinish(); setPending(true); }}>
        <h2>Review</h2>
      </WizardLayout>;
    }
    render(<PendingWizard />);
    await user.click(await screen.findByRole('button', { name: 'Finish' }));
    const finish = screen.getByRole('button', { name: 'Creating resource' });
    expect(finish).toHaveAttribute('aria-disabled', 'true');
    await user.click(finish);
    finish.focus();
    await user.keyboard('{Enter} ');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('focuses the first available control when a new step has no heading', async () => {
    const user = userEvent.setup();
    function NoHeading() {
      const [current, setCurrent] = useState(0);
      return <WizardLayout mode="overlay" open title="Create resource" steps={steps} current={current} onStepChange={setCurrent}>
        {current === 0 ? <input aria-label="First step" /> : <>
          <div hidden><input aria-label="Hidden control" /></div>
          <input disabled aria-label="Disabled control" />
          <input aria-label="Available control" />
        </>}
      </WizardLayout>;
    }
    render(<NoHeading />);
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Available control' })).toHaveFocus());
  });
});
